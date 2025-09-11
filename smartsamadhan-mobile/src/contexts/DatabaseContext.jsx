import { createContext, useContext, useState, useCallback } from 'react';
import { SupabaseDatabase } from '../database/SupabaseDatabase.js';

const DatabaseContext = createContext(null);

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within a DatabaseProvider');
  return ctx;
}

// Normalization helpers
function normalizeComplaints(raw = []) {
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

export function DatabaseProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const db = new SupabaseDatabase();

  const safeCall = useCallback(async (fn, fallback) => {
    try {
      setLoading(true);
      setError(null);
      return await fn(db);
    } catch (e) {
      console.warn('[Database] operation failed:', e.message);
      setError(e.message);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Public API
  const api = {
    loading,
    error,
    database: db,

    // Complaints
    getAllComplaints: () => safeCall(db => db.getAllComplaints().then(normalizeComplaints), []),
    getComplaintById: (id) => safeCall(db => db.getComplaintById(id).then(c => c ? normalizeComplaints([c]).then(a => a[0]) : null), null),
    getComplaintByRegNumber: (reg) => safeCall(db => db.getComplaintByRegNumber(reg).then(c => c ? normalizeComplaints([c]).then(a => a[0]) : null), null),
    getUserComplaints: (userId) => safeCall(db => db.getUserComplaints(userId).then(normalizeComplaints), []),
    addComplaint: (userId, data) => safeCall(db => db.addComplaint(userId, data), null),
    updateComplaintStatus: (id, status, note) => safeCall(db => db.updateComplaintStatus(id, status, note).then(c => c ? normalizeComplaints([c]).then(a => a[0]) : null), null),

    // Analytics
    getComplaintStats: (filters = {}) => safeCall(db => db.getComplaintStats(filters), { total: 0, byStatus: {}, byPriority: {}, byDepartment: {} }),
  };

  return <DatabaseContext.Provider value={api}>{children}</DatabaseContext.Provider>;
}

export default DatabaseContext;
