import supabase from '../supabaseClient.js';

/**
 * Supabase Database Implementation for Mobile
 * Uses Supabase for data persistence
 */
export class SupabaseDatabase {
  constructor() {
    this.supabase = supabase;
    this.initialized = true; // Already initialized with client
  }

  // User operations
  async getUser(username) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(userId) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async updateUser(userId, changes) {
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
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  // Complaint operations
  async getAllComplaints() {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async getComplaintById(complaintId) {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getComplaintByRegNumber(regNumber) {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('reg_number', regNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserComplaints(userId) {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async addComplaint(userId, complaintData) {
    const nowISO = new Date().toISOString();
    const today = nowISO.split('T')[0];

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

    // Attachments handling: if attachmentsMeta provided, store metadata and count
    if (Array.isArray(complaintData.attachmentsMeta) && complaintData.attachmentsMeta.length > 0) {
      newComplaint.attachments = complaintData.attachmentsMeta; // store array of metadata
      newComplaint.attachments_count = complaintData.attachmentsMeta.length;
    } else if (typeof complaintData.attachments === 'number') {
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
    const { error } = await this.supabase
      .from('complaints')
      .delete()
      .eq('id', complaintId);

    if (error) throw error;
  }

  // Analytics operations
  async getComplaintStats(filters = {}) {
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

  // Helper methods
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key] || 'Unknown';
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
}
