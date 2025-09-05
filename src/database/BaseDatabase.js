/**
 * Base Database Interface
 * Defines the contract for all database implementations
 */
export class BaseDatabase {
  constructor(config = {}) {
    this.config = config;
  }

  // User operations
  async getUser(username) { throw new Error('Method not implemented'); }
  async getUserById(userId) { throw new Error('Method not implemented'); }
  async getAllUsers() { throw new Error('Method not implemented'); }
  async addUser(userData) { throw new Error('Method not implemented'); }
  async updateUser(userId, changes) { throw new Error('Method not implemented'); }
  async deleteUser(userId) { throw new Error('Method not implemented'); }

  // Admin operations
  async getAdmin(username) { throw new Error('Method not implemented'); }
  async getAllAdmins() { throw new Error('Method not implemented'); }
  async getAdminsByLevel(level) { throw new Error('Method not implemented'); }
  async addAdmin(adminData) { throw new Error('Method not implemented'); }
  async updateAdmin(adminId, changes) { throw new Error('Method not implemented'); }
  async deleteAdmin(adminId) { throw new Error('Method not implemented'); }

  // Complaint operations
  async getAllComplaints() { throw new Error('Method not implemented'); }
  async getComplaintById(complaintId) { throw new Error('Method not implemented'); }
  async getComplaintByRegNumber(regNumber) { throw new Error('Method not implemented'); }
  async getUserComplaints(userId) { throw new Error('Method not implemented'); }
  async addComplaint(userId, complaintData) { throw new Error('Method not implemented'); }
  async updateComplaint(complaintId, changes) { throw new Error('Method not implemented'); }
  async updateComplaintStatus(complaintId, newStatus, note = '') { throw new Error('Method not implemented'); }
  async deleteComplaint(complaintId) { throw new Error('Method not implemented'); }

  // Analytics operations
  async getComplaintStats(filters = {}) { throw new Error('Method not implemented'); }
  async getDepartmentStats() { throw new Error('Method not implemented'); }
  async getPriorityStats() { throw new Error('Method not implemented'); }

  // Utility operations
  async initialize() { throw new Error('Method not implemented'); }
  async clearAll() { throw new Error('Method not implemented'); }
  async exportData() { throw new Error('Method not implemented'); }
  async importData(data) { throw new Error('Method not implemented'); }
}
