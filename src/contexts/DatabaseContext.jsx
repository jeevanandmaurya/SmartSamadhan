import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient.js';
import { EnvironmentDatabaseFactory } from '../database/DatabaseFactory.js';

// Database Context using modular abstraction layer
const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};



export const DatabaseProvider = ({ children }) => {
  const [database, setDatabase] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [configError, setConfigError] = useState(null);

  // Initialize database on mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const db = EnvironmentDatabaseFactory.getDatabase();
        if (!db) {
          setConfigError('Supabase environment variables missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY to your .env file and restart dev server.');
          setIsInitialized(true);
          return;
        }
        await db.initialize();
        setDatabase(db);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Supabase database:', error);
        setConfigError(error.message || 'Unknown initialization error');
        setIsInitialized(true);
      }
    };

    initDatabase();
  }, []);

  // Loading state
  if (!isInitialized) {
    return (
      <DatabaseContext.Provider value={{ loading: true }}>
        {children}
      </DatabaseContext.Provider>
    );
  }

  if (configError && !supabase) {
    return (
      <DatabaseContext.Provider value={{ loading: false, error: configError }}>
        <div style={{ padding: 24, fontFamily: 'monospace', color: 'var(--fg)' }}>
          <h3 style={{ marginTop: 0 }}>Configuration Error</h3>
          <p>{configError}</p>
          <code style={{ display: 'block', background: 'var(--card)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
            VITE_SUPABASE_URL=your_project_url<br/>
            VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
          </code>
        </div>
        {children}
      </DatabaseContext.Provider>
  );
  }

  // Wrapper functions that use the database abstraction
  const getUser = async (username) => {
    try {
  const u = await database.getUser(username);
  if (!u) return null;
  return normalizeActor(u, 'user');
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const getUserComplaints = async (userId) => {
    try {
  const raw = await database.getUserComplaints(userId);
  return await normalizeComplaints(raw);
    } catch (error) {
      console.error('Error getting user complaints:', error);
      return [];
    }
  };

  const addUser = async (userData) => {
    try {
      return await database.addUser(userData);
    } catch (error) {
      console.error('Error adding user:', error);
      return null;
    }
  };

  const updateUser = async (userId, changes) => {
    try {
      const row = await database.updateUser(userId, changes);
      return normalizeActor(row, 'user');
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await database.deleteUser(userId);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      await database.deleteAdmin(adminId);
      return true;
    } catch (error) {
      console.error('Error deleting admin:', error);
      return false;
    }
  };

  const addComplaint = async (userId, complaintData) => {
    try {
      return await database.addComplaint(userId, complaintData);
    } catch (error) {
      console.error('Error adding complaint:', error);
      return null;
    }
  };

  const getAdmin = async (username) => {
    try {
  const a = await database.getAdmin(username);
  if (!a) return null;
  return normalizeActor(a, 'admin');
    } catch (error) {
      console.error('Error getting admin:', error);
      return null;
    }
  };

  // Fetch admin by id (safer than username for email-based auth)
  const getAdminById = async (adminId) => {
    try {
      if (!adminId || !database?.supabase) return null;
      const { data, error } = await database.supabase
        .from('admins')
        .select('*')
        .eq('id', adminId)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeActor(data, 'admin') : null;
    } catch (e) {
      console.error('Error getting admin by id:', e);
      return null;
    }
  };

  const getAllAdmins = async () => {
    try {
  const list = await database.getAllAdmins();
  return (list || []).map(a => normalizeActor(a, 'admin'));
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  };

  const getAllUsers = async () => {
    try {
      const list = await database.getAllUsers();
      return (list || []).map(u => normalizeActor(u, 'user'));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  const getAdminsByLevel = async (level) => {
    try {
  const list = await database.getAdminsByLevel(level);
  return (list || []).map(a => normalizeActor(a, 'admin'));
    } catch (error) {
      console.error('Error getting admins by level:', error);
      return [];
    }
  };

  const getAllComplaints = async () => {
    try {
  const raw = await database.getAllComplaints();
  return await normalizeComplaints(raw);
    } catch (error) {
      console.error('Error getting all complaints:', error);
      return [];
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus, note = '') => {
    try {
  const updated = await database.updateComplaintStatus(complaintId, newStatus, note);
  if (!updated) return null;
  const [normalized] = await normalizeComplaints([updated]);
  return normalized;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      return null;
    }
  };

  const getComplaintByRegNumber = async (regNumber) => {
    try {
  const row = await database.getComplaintByRegNumber(regNumber);
  if (!row) return null;
  const [normalized] = await normalizeComplaints([row]);
  return normalized;
    } catch (error) {
      console.error('Error getting complaint by reg number:', error);
      return null;
    }
  };

  const getUserById = async (userId) => {
    try {
      const row = await database.getUserById(userId);
      return normalizeActor(row, 'user');
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  };

  // Analytics functions
  const getComplaintStats = async (filters = {}) => {
    try {
      return await database.getComplaintStats(filters);
    } catch (error) {
      console.error('Error getting complaint stats:', error);
      return { total: 0, byStatus: {}, byPriority: {}, byDepartment: {} };
    }
  };

  const getDepartmentStats = async () => {
    try {
      return await database.getDepartmentStats();
    } catch (error) {
      console.error('Error getting department stats:', error);
      return {};
    }
  };

  const getPriorityStats = async () => {
    try {
      return await database.getPriorityStats();
    } catch (error) {
      console.error('Error getting priority stats:', error);
      return {};
    }
  };

  const value = {
    // Loading state
    loading: false,

    // Data access (for backward compatibility)
    users: [],
    admins: [],
    complaints: [],

    // User functions
    getUser,
    getUserComplaints,
    addUser,
    updateUser,
    deleteUser,
    addComplaint,

    // Admin functions
    getAdmin,
    getAllAdmins,
    getAllUsers,
    getAdminsByLevel,
  deleteAdmin,
  getAdminById,

    // Complaint functions
    getAllComplaints,
    updateComplaintStatus,
    getComplaintByRegNumber,

    // Helper functions
    getUserById,

    // Analytics functions
    getComplaintStats,
    getDepartmentStats,
    getPriorityStats,

    // Database info
    databaseType: EnvironmentDatabaseFactory.getDatabaseType(),
    database: database
  };

  // -----------------
  // Normalization Layer (Supabase -> legacy camelCase expected by UI)
  // -----------------
  async function normalizeComplaints(complaints = []) {
    if (!Array.isArray(complaints) || complaints.length === 0) return [];

    const mapped = complaints.map(c => ({
      ...c,
      // ID mapping
      id: c.id,
      // Registration number
      regNumber: c.regNumber ?? c.reg_number,
      // Date fields
      dateSubmitted: c.dateSubmitted ?? c.date_submitted ?? c.submitted_at?.split('T')[0],
      lastUpdated: c.lastUpdated ?? c.last_updated,
      submittedAt: c.submittedAt ?? c.submitted_at,
      // User linkage
      userId: c.userId ?? c.user_id,
  // Attachments
  attachments: c.attachments || [],
  attachmentsCount: c.attachments_count ?? (Array.isArray(c.attachments) ? c.attachments.length : c.attachmentsCount),
      // Category breakdown (attempt to split if only category string present)
      ...(deriveCategoryParts(
        c.category,
        c.mainCategory ?? c.main_category,
        c.subCategory1 ?? c.sub_category1,
        c.specificIssue ?? c.specific_issue
      )),
      // Preserve updates array
      updates: c.updates || []
    }));

    // Enrich user names if missing and supabase available
    const needUserNames = mapped.some(m => !m.userName && m.userId);
    if (needUserNames && supabase) {
      try {
        const uniqueIds = [...new Set(mapped.filter(m => m.userId).map(m => m.userId))];
        if (uniqueIds.length > 0) {
          const { data: userRows } = await supabase
            .from('users')
            .select('id, full_name');
          const userMap = (userRows || []).reduce((acc, u) => {
            acc[u.id] = u.full_name;
            return acc;
          }, {});
          mapped.forEach(m => {
            if (!m.userName && m.userId) m.userName = userMap[m.userId] || 'User';
          });
        }
      } catch (e) {
        console.warn('Failed enriching user names:', e);
      }
    }
    return mapped;
  }

  function normalizeActor(row, fallbackRole) {
    if (!row) return null;
    return {
      ...row,
      fullName: row.fullName || row.full_name,
      createdAt: row.createdAt || row.created_at,
      role: row.role || fallbackRole
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

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
