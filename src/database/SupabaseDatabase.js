import { BaseDatabase } from './BaseDatabase.js';

/**
 * Supabase Database Implementation
 * Uses Supabase for data persistence
 */
export class SupabaseDatabase extends BaseDatabase {
  constructor(config = {}) {
    super(config);
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.supabase = config.client || null; // allow injected client
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    if (this.supabase) { this.initialized = true; return; }
    try {
      const { createClient } = await import('@supabase/supabase-js');
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize Supabase:', e);
      throw e;
    }
  }

  // User operations
  async getUser(username) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(userId) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllUsers() {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async addUser(userData) {
  // With current schema users.id references auth.users(id).
  // Creation must happen via auth.signUp (trigger inserts row).
  // This method is intentionally disabled to prevent FK violations.
  await this.initialize();
  throw new Error('addUser: Disabled. Use auth.signUp to create users (trigger will insert profile).');
  }

  async updateUser(userId, changes) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('users')
      .update(changes)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(userId) {
    await this.initialize();
    // This will cascade and delete the auth.users entry as well.
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  // Admin operations
  async getAdmin(username) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAdminById(adminId) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllAdmins() {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('admins')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async getAdminsByLevel(level) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('permission_level', level);

    if (error) {
      console.error(`Error fetching admins for level ${level}:`, error);
      throw error;
    }
    return data || [];
  }

  async addAdmin(adminData) {
  // Admin creation is restricted; admins must be inserted manually after creating an auth user.
  await this.initialize();
  throw new Error('addAdmin: Disabled. Manually create admin auth user then insert into admins table.');
  }

  async updateAdmin(adminId, changes) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('admins')
      .update(changes)
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAdmin(adminId) {
    await this.initialize();
    // This will cascade and delete the auth.users entry as well.
    const { error } = await this.supabase
      .from('admins')
      .delete()
      .eq('id', adminId);

    if (error) throw error;
  }

  // Complaint operations
  async getAllComplaints() {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async getComplaintById(complaintId) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getComplaintByRegNumber(regNumber) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('reg_number', regNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserComplaints(userId) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async addComplaint(userId, complaintData) {
    await this.initialize();
    const nowISO = new Date().toISOString();
    const today = nowISO.split('T')[0];

    // Accept both camelCase and snake_case from caller
    const generatedId = `COMP${Date.now()}`;
    const newComplaint = {
      id: complaintData.id || generatedId,
      user_id: userId,
      reg_number: complaintData.regNumber || complaintData.reg_number || `REG${Date.now().toString().slice(-3)}`,
      title: complaintData.title,
      description: complaintData.description,
      status: complaintData.status || 'Pending',
      priority: complaintData.priority || 'Medium',
      category: complaintData.category,
      main_category: complaintData.mainCategory || complaintData.main_category || null,
      sub_category1: complaintData.subCategory1 || complaintData.sub_category1 || null,
      specific_issue: complaintData.specificIssue || complaintData.specific_issue || null,
      department: complaintData.department,
      city: complaintData.city,
      location: complaintData.location,
      latitude: complaintData.latitude,
      longitude: complaintData.longitude,
      assigned_to: complaintData.assignedTo || complaintData.assigned_to || null,
      submitted_at: complaintData.submittedAt || nowISO,
      date_submitted: today,
      last_updated: today,
      updates: [
        {
          date: today,
          status: 'Submitted',
          note: 'Issue reported and registered'
        }
      ]
    };

    // Optional attachments metadata support (requires DB columns: attachments jsonb, attachments_count int)
    if (Array.isArray(complaintData.attachmentsMeta) && complaintData.attachmentsMeta.length > 0) {
      newComplaint.attachments = complaintData.attachmentsMeta; // json array
      newComplaint.attachments_count = complaintData.attachmentsMeta.length;
    } else if (typeof complaintData.attachments === 'number') {
      // legacy numeric count only
      newComplaint.attachments_count = complaintData.attachments;
    }

    const { data, error } = await this.supabase
      .from('complaints')
      .insert([newComplaint])
      .select()
      .single();

    if (error) {
      console.error('Supabase addComplaint failed:', error);
      throw error;
    }
    return data;
  }

  async updateComplaint(complaintId, changes) {
    await this.initialize();
    const { data, error } = await this.supabase
      .from('complaints')
      .update(changes)
      .eq('id', complaintId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComplaintStatus(complaintId, newStatus, note = '') {
    await this.initialize();
    const updateData = {
      status: newStatus,
      last_updated: new Date().toISOString().split('T')[0],
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

      const { data, error } = await this.supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return null;
  }

  async deleteComplaint(complaintId) {
    await this.initialize();
    const { error } = await this.supabase
      .from('complaints')
      .delete()
      .eq('id', complaintId);

    if (error) throw error;
  }

  // Analytics operations
  async getComplaintStats(filters = {}) {
    await this.initialize();
    let query = this.supabase.from('complaints').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    const { data: complaints, error } = await query;
    if (error) throw error;

    return {
      total: complaints.length,
      byStatus: this.groupBy(complaints, 'status'),
      byPriority: this.groupBy(complaints, 'priority'),
      byDepartment: this.groupBy(complaints, 'department')
    };
  }

  async getDepartmentStats() {
    await this.initialize();
    const { data: complaints, error } = await this.supabase
      .from('complaints')
      .select('department');

    if (error) throw error;
    return this.groupBy(complaints, 'department');
  }

  async getPriorityStats() {
    await this.initialize();
    const { data: complaints, error } = await this.supabase
      .from('complaints')
      .select('priority');

    if (error) throw error;
    return this.groupBy(complaints, 'priority');
  }

  // Utility operations
  async clearAll() {
    await this.initialize();
    // Note: This is a simplified implementation
    // In production, you might want to truncate tables
    console.warn('clearAll not fully implemented for Supabase');
  }

  async exportData() {
    await this.initialize();
    const [users, admins, complaints] = await Promise.all([
      this.getAllUsers(),
      this.getAllAdmins(),
      this.getAllComplaints()
    ]);

    return JSON.stringify({ users, admins, complaints }, null, 2);
  }

  async importData(jsonData) {
    await this.initialize();
    try {
      const data = JSON.parse(jsonData);

      // Import users
      if (data.users && data.users.length > 0) {
        const { error } = await this.supabase
          .from('users')
          .insert(data.users);
        if (error) throw error;
      }

      // Import admins
      if (data.admins && data.admins.length > 0) {
        const { error } = await this.supabase
          .from('admins')
          .insert(data.admins);
        if (error) throw error;
      }

      // Import complaints
      if (data.complaints && data.complaints.length > 0) {
        const { error } = await this.supabase
          .from('complaints')
          .insert(data.complaints);
        if (error) throw error;
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
