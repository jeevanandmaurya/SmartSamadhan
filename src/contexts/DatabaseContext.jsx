// REWRITTEN DATABASE CONTEXT (Step 1)
// Strategy: slim, promise-based, minimal state. We only expose functions; we don't mirror data arrays in context.
// Keeps same exported hooks so existing components continue working unchanged.

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import supabase from '../supabaseClient.js';
import { EnvironmentDatabaseFactory } from '../database/DatabaseFactory.js';

const DatabaseContext = createContext(null);

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within a DatabaseProvider');
  return ctx;
}

// Normalization helpers (kept lightweight)
function normalizeActor(row) {
  if (!row) return null;
  return {
    ...row,
    fullName: row.fullName || row.full_name,
    createdAt: row.createdAt || row.created_at,
    permissionLevel: row.permission_level || 'user',
  };
}

function deriveCategoryParts(categoryString, mainCategory, subCategory1, specificIssue) {
  if (mainCategory && subCategory1 && specificIssue) return { mainCategory, subCategory1, specificIssue };
  if (!categoryString || typeof categoryString !== 'string') return { mainCategory, subCategory1, specificIssue };
  const parts = categoryString.split('>').map(p => p.trim()).filter(Boolean);
  return {
    mainCategory: mainCategory || parts[0],
    subCategory1: subCategory1 || parts[1],
    specificIssue: specificIssue || parts[2]
  };
}

async function normalizeComplaints(raw = []) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map(c => ({
    ...c,
    regNumber: c.regNumber ?? c.reg_number,
    dateSubmitted: c.dateSubmitted ?? c.date_submitted ?? c.submitted_at?.split('T')[0],
    lastUpdated: c.lastUpdated ?? c.last_updated,
    submittedAt: c.submittedAt ?? c.submitted_at,
    userId: c.userId ?? c.user_id,
    attachments: c.attachments || [],
    attachmentsCount: c.attachments_count ?? (Array.isArray(c.attachments) ? c.attachments.length : c.attachmentsCount),
    ...deriveCategoryParts(c.category, c.mainCategory ?? c.main_category, c.subCategory1 ?? c.sub_category1, c.specificIssue ?? c.specific_issue),
    updates: c.updates || []
  }));
}

export function DatabaseProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const dbRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const db = EnvironmentDatabaseFactory.getDatabase();
        if (!db) {
          setError('Missing Supabase configuration (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).');
          setReady(true);
          return;
        }
        await db.initialize();
        dbRef.current = db;
      } catch (e) {
        console.error('[Database] initialization failed', e);
        setError(e.message);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const safeCall = useCallback(async (fn, fallback) => {
    try {
      if (!dbRef.current) return fallback;
      return await fn(dbRef.current);
    } catch (e) {
      console.warn('[Database] operation failed:', e.message);
      return fallback;
    }
  }, []);

  // Public API (mirrors previous context surface)
  const api = useMemo(() => ({
    loading: !ready,
    error,
    database: dbRef.current,
    databaseType: 'supabase',

    // Users
    getUser: (username) => safeCall(db => db.getUser(username).then(normalizeActor), null),
    getUserById: (id) => safeCall(db => db.getUserById(id).then(normalizeActor), null),
    getAllUsers: () => safeCall(db => db.getAllUsers().then(list => list.map(normalizeActor)), []),
    addUser: (data) => safeCall(db => db.addUser(data), null),
    updateUser: (id, changes) => safeCall(db => db.updateUser(id, changes).then(normalizeActor), null),
    deleteUser: (id) => safeCall(db => db.deleteUser(id).then(() => true), false),

    // Admins
    getAdmin: (username) => safeCall(db => db.getAdmin(username).then(normalizeActor), null),
    getAllAdmins: () => safeCall(db => db.getAllAdmins().then(list => list.map(normalizeActor)), []),
    getAdminsByLevel: (lvl) => safeCall(db => db.getAdminsByLevel(lvl).then(list => list.map(normalizeActor)), []),
    deleteAdmin: (id) => safeCall(db => db.deleteAdmin(id).then(() => true), false),
    getAdminById: (id) => safeCall(async db => {
      if (!id || !db.supabase) return null;
      const { data, error: qErr } = await db.supabase.from('admins').select('*').eq('id', id).maybeSingle();
      if (qErr) throw qErr;
      return data ? normalizeActor(data) : null;
    }, null),

    // Complaints
    getAllComplaints: () => safeCall(db => db.getAllComplaints().then(normalizeComplaints), []),
    getComplaintByRegNumber: (reg) => safeCall(db => db.getComplaintByRegNumber(reg).then(r => r ? normalizeComplaints([r]).then(a => a[0]) : null), null),
    getUserComplaints: (userId) => safeCall(db => db.getUserComplaints(userId).then(normalizeComplaints), []),
    addComplaint: (userId, data) => safeCall(db => db.addComplaint(userId, data), null),
    updateComplaintStatus: (id, status, note) => safeCall(db => db.updateComplaintStatus(id, status, note).then(r => r ? normalizeComplaints([r]).then(a => a[0]) : null), null),

    // Analytics
    getComplaintStats: (filters = {}) => safeCall(db => db.getComplaintStats(filters), { total: 0, byStatus: {}, byPriority: {}, byDepartment: {} }),
    getDepartmentStats: () => safeCall(db => db.getDepartmentStats(), {}),
    getPriorityStats: () => safeCall(db => db.getPriorityStats(), {}),
  }), [ready, error, safeCall]);

  return <DatabaseContext.Provider value={api}>{children}</DatabaseContext.Provider>;
}

export default DatabaseContext;
