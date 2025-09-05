import { BaseDatabase } from './BaseDatabase.js';

/**
 * Firebase Database Implementation
 * Uses Firebase Firestore for data persistence
 */
export class FirebaseDatabase extends BaseDatabase {
  constructor(config = {}) {
    super(config);
    this.firebaseConfig = config.firebaseConfig;
    this.app = null;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling Firebase if not used
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } = await import('firebase/firestore');

      this.app = initializeApp(this.firebaseConfig);
      this.db = getFirestore(this.app);
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize Firebase:', e);
      throw e;
    }
  }

  // Helper methods for Firestore operations
  async getDocument(collectionName, docId) {
    const docRef = doc(this.db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async getCollection(collectionName, conditions = []) {
    let q = collection(this.db, collectionName);

    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async setDocument(collectionName, docId, data) {
    const docRef = doc(this.db, collectionName, docId);
    await setDoc(docRef, data);
    return { id: docId, ...data };
  }

  async updateDocument(collectionName, docId, data) {
    const docRef = doc(this.db, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data };
  }

  async deleteDocument(collectionName, docId) {
    const docRef = doc(this.db, collectionName, docId);
    await deleteDoc(docRef);
  }

  // User operations
  async getUser(username) {
    await this.initialize();
    const users = await this.getCollection('users', [
      { field: 'username', operator: '==', value: username }
    ]);
    return users.length > 0 ? users[0] : null;
  }

  async getUserById(userId) {
    await this.initialize();
    return await this.getDocument('users', userId);
  }

  async getAllUsers() {
    await this.initialize();
    return await this.getCollection('users');
  }

  async addUser(userData) {
    await this.initialize();
    const userId = `user${Date.now()}`;
    const newUser = {
      ...userData,
      id: userId,
      createdAt: new Date().toISOString().split('T')[0],
      complaints: []
    };
    return await this.setDocument('users', userId, newUser);
  }

  async updateUser(userId, changes) {
    await this.initialize();
    return await this.updateDocument('users', userId, changes);
  }

  async deleteUser(userId) {
    await this.initialize();
    await this.deleteDocument('users', userId);
  }

  // Admin operations
  async getAdmin(username) {
    await this.initialize();
    const admins = await this.getCollection('admins', [
      { field: 'username', operator: '==', value: username }
    ]);
    return admins.length > 0 ? admins[0] : null;
  }

  async getAllAdmins() {
    await this.initialize();
    return await this.getCollection('admins');
  }

  async getAdminsByLevel(level) {
    await this.initialize();
    return await this.getCollection('admins', [
      { field: 'level', operator: '==', value: level }
    ]);
  }

  async addAdmin(adminData) {
    await this.initialize();
    const adminId = `admin${Date.now()}`;
    const newAdmin = {
      ...adminData,
      id: adminId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    return await this.setDocument('admins', adminId, newAdmin);
  }

  async updateAdmin(adminId, changes) {
    await this.initialize();
    return await this.updateDocument('admins', adminId, changes);
  }

  async deleteAdmin(adminId) {
    await this.initialize();
    await this.deleteDocument('admins', adminId);
  }

  // Complaint operations
  async getAllComplaints() {
    await this.initialize();
    return await this.getCollection('complaints');
  }

  async getComplaintById(complaintId) {
    await this.initialize();
    return await this.getDocument('complaints', complaintId);
  }

  async getComplaintByRegNumber(regNumber) {
    await this.initialize();
    const complaints = await this.getCollection('complaints', [
      { field: 'regNumber', operator: '==', value: regNumber }
    ]);
    return complaints.length > 0 ? complaints[0] : null;
  }

  async getUserComplaints(userId) {
    await this.initialize();
    return await this.getCollection('complaints', [
      { field: 'userId', operator: '==', value: userId }
    ]);
  }

  async addComplaint(userId, complaintData) {
    await this.initialize();
    const complaintId = `COMP${Date.now()}`;
    const newComplaint = {
      ...complaintData,
      id: complaintId,
      userId,
      regNumber: `REG${Date.now().toString().slice(-3)}`,
      status: complaintData.status || 'Pending',
      assignedTo: complaintData.assignedTo || 'Unassigned',
      submittedAt: complaintData.submittedAt || new Date().toISOString(),
      dateSubmitted: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      updates: [
        {
          date: new Date().toISOString().split('T')[0],
          status: 'Submitted',
          note: 'Issue reported and registered'
        }
      ]
    };

    // Add to complaints collection
    await this.setDocument('complaints', complaintId, newComplaint);

    // Update user's complaints array
    const user = await this.getUserById(userId);
    if (user) {
      const userComplaints = user.complaints || [];
      userComplaints.push(newComplaint);
      await this.updateUser(userId, { complaints: userComplaints });
    }

    return newComplaint;
  }

  async updateComplaint(complaintId, changes) {
    await this.initialize();
    return await this.updateDocument('complaints', complaintId, changes);
  }

  async updateComplaintStatus(complaintId, newStatus, note = '') {
    await this.initialize();
    const updateData = {
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      updates: []
    };

    const complaint = await this.getComplaintById(complaintId);
    if (complaint) {
      updateData.updates = [
        ...complaint.updates,
        {
          date: new Date().toISOString().split('T')[0],
          status: newStatus,
          note: note || `Status updated to ${newStatus}`
        }
      ];
      return await this.updateDocument('complaints', complaintId, updateData);
    }
    return null;
  }

  async deleteComplaint(complaintId) {
    await this.initialize();
    await this.deleteDocument('complaints', complaintId);
  }

  // Analytics operations
  async getComplaintStats(filters = {}) {
    await this.initialize();
    let conditions = [];

    if (filters.status) {
      conditions.push({ field: 'status', operator: '==', value: filters.status });
    }
    if (filters.priority) {
      conditions.push({ field: 'priority', operator: '==', value: filters.priority });
    }
    if (filters.department) {
      conditions.push({ field: 'department', operator: '==', value: filters.department });
    }

    const complaints = await this.getCollection('complaints', conditions);

    return {
      total: complaints.length,
      byStatus: this.groupBy(complaints, 'status'),
      byPriority: this.groupBy(complaints, 'priority'),
      byDepartment: this.groupBy(complaints, 'department')
    };
  }

  async getDepartmentStats() {
    await this.initialize();
    const complaints = await this.getCollection('complaints');
    return this.groupBy(complaints, 'department');
  }

  async getPriorityStats() {
    await this.initialize();
    const complaints = await this.getCollection('complaints');
    return this.groupBy(complaints, 'priority');
  }

  // Utility operations
  async clearAll() {
    await this.initialize();
    // Note: This is a simplified implementation
    // In production, you might want to delete all documents
    console.warn('clearAll not fully implemented for Firebase');
  }

  async exportData() {
    await this.initialize();
    const users = await this.getAllUsers();
    const admins = await this.getAllAdmins();
    const complaints = await this.getAllComplaints();

    return JSON.stringify({ users, admins, complaints }, null, 2);
  }

  async importData(jsonData) {
    await this.initialize();
    try {
      const data = JSON.parse(jsonData);

      // Import users
      if (data.users) {
        for (const user of data.users) {
          await this.setDocument('users', user.id, user);
        }
      }

      // Import admins
      if (data.admins) {
        for (const admin of data.admins) {
          await this.setDocument('admins', admin.id, admin);
        }
      }

      // Import complaints
      if (data.complaints) {
        for (const complaint of data.complaints) {
          await this.setDocument('complaints', complaint.id, complaint);
        }
      }

      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  // Helper methods
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key] || 'Unknown';
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
}
