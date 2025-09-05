import { createContext, useContext, useState, useEffect } from 'react';

// Database Context for local data management
// Easily replaceable with Supabase/Firebase later
const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Mock database structure - easily replaceable with real database
const initialData = {
  users: [
    {
      id: 'user001',
      username: 'user',
      password: 'pass',
      email: 'user@example.com',
      fullName: 'John Citizen',
      phone: '+91-9876543210',
      address: '123 Main Street, City, State',
      createdAt: '2025-01-01',
      complaints: [
        {
          id: 'COMP001',
          regNumber: 'REG001',
          title: 'Pothole on Main Street',
          description: 'Pothole on Main Street causing traffic issues',
          status: 'Pending',
          priority: 'High',
          category: 'Road Maintenance',
          department: 'Public Works',
          location: 'Main Street, Sector 5',
          dateSubmitted: '2025-01-15',
          lastUpdated: '2025-01-20',
          assignedTo: 'John Smith',
          images: [],
          updates: [
            { date: '2025-01-15', status: 'Submitted', note: 'Complaint registered' },
            { date: '2025-01-16', status: 'Pending', note: 'Under review by department' }
          ]
        },
        {
          id: 'COMP002',
          regNumber: 'REG002',
          title: 'Broken Streetlight',
          description: 'Broken Streetlight at Park Avenue',
          status: 'In Progress',
          priority: 'Medium',
          category: 'Electricity',
          department: 'Electricity Department',
          location: 'Park Avenue, Sector 3',
          dateSubmitted: '2025-01-10',
          lastUpdated: '2025-01-18',
          assignedTo: 'Sarah Johnson',
          images: [],
          updates: [
            { date: '2025-01-10', status: 'Submitted', note: 'Complaint registered' },
            { date: '2025-01-12', status: 'In Progress', note: 'Technician assigned' }
          ]
        }
      ]
    },
    {
      id: 'user002',
      username: 'citizen',
      password: 'pass123',
      email: 'citizen@example.com',
      fullName: 'Jane Doe',
      phone: '+91-9876543211',
      address: '456 Oak Avenue, City, State',
      createdAt: '2025-01-05',
      complaints: [
        {
          id: 'COMP003',
          regNumber: 'REG003',
          title: 'Trash Bin Overflow',
          description: 'Trash Bin Overflow near Market Square',
          status: 'Resolved',
          priority: 'Low',
          category: 'Sanitation',
          department: 'Sanitation Department',
          location: 'Market Square, Sector 2',
          dateSubmitted: '2025-01-20',
          lastUpdated: '2025-01-22',
          assignedTo: 'Mike Davis',
          images: [],
          updates: [
            { date: '2025-01-20', status: 'Submitted', note: 'Complaint registered' },
            { date: '2025-01-21', status: 'In Progress', note: 'Worker assigned' },
            { date: '2025-01-22', status: 'Resolved', note: 'Issue resolved' }
          ]
        }
      ]
    }
  ],

  admins: [
    {
      id: 'admin001',
      username: 'admin',
      password: 'pass',
      email: 'admin@smartsamadhan.gov',
      fullName: 'State Administrator',
      role: 'State Admin',
      level: 'state',
      accessLevel: 3,
      department: 'State Administration',
      location: 'State Headquarters',
      permissions: ['view_all', 'manage_users', 'manage_reports', 'system_settings'],
      createdAt: '2024-01-01'
    },
    {
      id: 'admin002',
      username: 'cityadmin',
      password: 'city123',
      email: 'cityadmin@smartsamadhan.gov',
      fullName: 'City Administrator',
      role: 'City Admin',
      level: 'city',
      accessLevel: 2,
      department: 'City Administration',
      location: 'City Municipal Office',
      permissions: ['view_city', 'manage_city_users', 'manage_city_reports'],
      createdAt: '2024-06-01'
    },
    {
      id: 'admin003',
      username: 'sectoradmin',
      password: 'sector123',
      email: 'sectoradmin@smartsamadhan.gov',
      fullName: 'Sector Administrator',
      role: 'Sector Admin',
      level: 'sector',
      accessLevel: 1,
      department: 'Sector Administration',
      location: 'Sector 5 Office',
      permissions: ['view_sector', 'manage_sector_reports'],
      createdAt: '2024-08-01'
    }
  ],

  complaints: [
    // All complaints from users will be aggregated here
  ]
};

export const DatabaseProvider = ({ children }) => {
  const STORAGE_KEY = 'smartSamadhanDB';

  const aggregateComplaints = (users) =>
    users.flatMap(user =>
      (user.complaints || []).map(complaint => ({
        ...complaint,
        userId: user.id,
        userName: user.fullName,
      }))
    );

  const loadData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          complaints: aggregateComplaints(parsed.users || [])
        };
      }
    } catch (e) {
      console.warn('Failed to load DB from storage, using defaults.', e);
    }
    return { ...initialData, complaints: aggregateComplaints(initialData.users) };
  };

  const [data, setData] = useState(loadData);

  // Persist to localStorage on data change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to persist DB to storage.', e);
    }
  }, [data]);

  // User-related functions
  const getUser = (username) => {
    return data.users.find(user => user.username === username);
  };

  const getUserComplaints = (userId) => {
    const user = data.users.find(u => u.id === userId);
    return user ? user.complaints : [];
  };

  const addUser = (userData) => {
    const newUser = {
      id: `user${Date.now()}`,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address || '',
      createdAt: new Date().toISOString().split('T')[0],
      complaints: []
    };
    setData(prev => {
      const users = [...prev.users, newUser];
      return {
        ...prev,
        users,
        complaints: aggregateComplaints(users)
      };
    });
    return newUser;
  };

  const updateUser = (userId, changes) => {
    let updatedUserRef = null;
    setData(prev => {
      const users = prev.users.map(u => {
        if (u.id === userId) {
          updatedUserRef = { ...u, ...changes };
          return updatedUserRef;
        }
        return u;
      });
      return {
        ...prev,
        users,
        complaints: aggregateComplaints(users)
      };
    });
    return updatedUserRef;
  };

  const deleteUser = (userId) => {
    setData(prev => {
      const users = prev.users.filter(u => u.id !== userId);
      return {
        ...prev,
        users,
        complaints: aggregateComplaints(users)
      };
    });
  };

  const addComplaint = (userId, complaintData) => {
    const newComplaint = {
      id: `COMP${Date.now()}`,
      regNumber: `REG${Date.now().toString().slice(-3)}`,
      ...complaintData,
      dateSubmitted: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Pending',
      updates: [
        {
          date: new Date().toISOString().split('T')[0],
          status: 'Submitted',
          note: 'Complaint registered'
        }
      ]
    };

    setData(prev => {
      const users = prev.users.map(user =>
        user.id === userId
          ? { ...user, complaints: [...(user.complaints || []), newComplaint] }
          : user
      );
      const userRef = users.find(u => u.id === userId);
      return {
        ...prev,
        users,
        complaints: [...prev.complaints, { ...newComplaint, userId, userName: userRef?.fullName }]
      };
    });

    return newComplaint;
  };

  // Admin-related functions
  const getAdmin = (username) => {
    return data.admins.find(admin => admin.username === username);
  };

  const getAllAdmins = () => {
    return data.admins;
  };

  const getAdminsByLevel = (level) => {
    return data.admins.filter(admin => admin.level === level);
  };

  // Complaint-related functions
  const getAllComplaints = () => {
    return data.complaints;
  };

  const updateComplaintStatus = (complaintId, newStatus, note = '') => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user => ({
        ...user,
        complaints: user.complaints.map(complaint =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: newStatus,
                lastUpdated: new Date().toISOString().split('T')[0],
                updates: [
                  ...complaint.updates,
                  {
                    date: new Date().toISOString().split('T')[0],
                    status: newStatus,
                    note: note || `Status updated to ${newStatus}`
                  }
                ]
              }
            : complaint
        )
      })),
      complaints: prev.complaints.map(complaint =>
        complaint.id === complaintId
          ? {
              ...complaint,
              status: newStatus,
              lastUpdated: new Date().toISOString().split('T')[0],
              updates: [
                ...complaint.updates,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: newStatus,
                  note: note || `Status updated to ${newStatus}`
                }
              ]
            }
          : complaint
      )
    }));
  };

  // Helper functions
  const getUserById = (userId) => {
    return data.users.find(user => user.id === userId);
  };

  const getComplaintByRegNumber = (regNumber) => {
    return data.complaints.find(complaint => complaint.regNumber === regNumber);
  };

  const value = {
    // Data
    users: data.users,
    admins: data.admins,
    complaints: data.complaints,

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

    // Helpers
    getUserById
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
