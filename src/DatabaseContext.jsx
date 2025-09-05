import { createContext, useContext, useState, useEffect } from 'react';
import { EnvironmentDatabaseFactory } from './database/DatabaseFactory.js';

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

  // Initialize database on mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const db = EnvironmentDatabaseFactory.getDatabase();
        await db.initialize();
        setDatabase(db);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage
        const { LocalStorageDatabase } = await import('./database/LocalStorageDatabase.js');
        const fallbackDb = new LocalStorageDatabase();
        await fallbackDb.initialize();
        setDatabase(fallbackDb);
        setIsInitialized(true);
      }
    };

    initDatabase();
  }, []);

  // Loading state
  if (!isInitialized || !database) {
    return (
      <DatabaseContext.Provider value={{ loading: true }}>
        {children}
      </DatabaseContext.Provider>
    );
  }

  // Wrapper functions that use the database abstraction
  const getUser = async (username) => {
    try {
      return await database.getUser(username);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const getUserComplaints = async (userId) => {
    try {
      return await database.getUserComplaints(userId);
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
      return await database.updateUser(userId, changes);
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
      return await database.getAdmin(username);
    } catch (error) {
      console.error('Error getting admin:', error);
      return null;
    }
  };

  const getAllAdmins = async () => {
    try {
      return await database.getAllAdmins();
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  };

  const getAdminsByLevel = async (level) => {
    try {
      return await database.getAdminsByLevel(level);
    } catch (error) {
      console.error('Error getting admins by level:', error);
      return [];
    }
  };

  const getAllComplaints = async () => {
    try {
      return await database.getAllComplaints();
    } catch (error) {
      console.error('Error getting all complaints:', error);
      return [];
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus, note = '') => {
    try {
      return await database.updateComplaintStatus(complaintId, newStatus, note);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      return null;
    }
  };

  const getComplaintByRegNumber = async (regNumber) => {
    try {
      return await database.getComplaintByRegNumber(regNumber);
    } catch (error) {
      console.error('Error getting complaint by reg number:', error);
      return null;
    }
  };

  const getUserById = async (userId) => {
    try {
      return await database.getUserById(userId);
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
    getAdminsByLevel,

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

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
