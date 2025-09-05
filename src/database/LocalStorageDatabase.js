import { BaseDatabase } from './BaseDatabase.js';

/**
 * LocalStorage Database Implementation
 * Uses browser localStorage for data persistence
 */
export class LocalStorageDatabase extends BaseDatabase {
  constructor(config = {}) {
    super(config);
    this.storageKey = config.storageKey || 'smartSamadhanDB';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.data = JSON.parse(raw);
      } else {
        this.data = this.getInitialData();
      }
      this.initialized = true;
    } catch (e) {
      console.warn('Failed to load DB from storage, using defaults.', e);
      this.data = this.getInitialData();
      this.initialized = true;
    }
  }

  getInitialData() {
    return {
      users: [
        {
          id: 'user001',
          username: 'user',
          password: 'pass',
          email: 'user@example.com',
          fullName: 'John Citizen',
          phone: '91xxxxxxxx',
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
              latitude: 28.6139,
              longitude: 77.2090,
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
              latitude: 28.6229,
              longitude: 77.2190,
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
          phone: '91xxxxxxxx',
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
              latitude: 28.6049,
              longitude: 77.1990,
              dateSubmitted: '2025-01-20',
              lastUpdated: '2025-01-22',
              assignedTo: 'Mike Davis',
              images: [],
              updates: [
                { date: '2025-01-20', status: 'Submitted', note: 'Complaint registered' },
                { date: '2025-01-21', status: 'In Progress', note: 'Worker assigned' },
                { date: '2025-01-22', status: 'Resolved', note: 'Issue resolved' }
              ]
            },
            {
              id: 'COMP004',
              regNumber: 'REG004',
              title: 'Water Leakage',
              description: 'Water main leak on Park Street',
              status: 'Pending',
              priority: 'High',
              category: 'Water Supply',
              department: 'Water Department',
              location: 'Park Street, Sector 4',
              latitude: 28.6150,
              longitude: 77.2050,
              dateSubmitted: '2025-01-18',
              lastUpdated: '2025-01-18',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-18', status: 'Submitted', note: 'Complaint registered' }
              ]
            },
            {
              id: 'COMP005',
              regNumber: 'REG005',
              title: 'Street Light Not Working',
              description: 'Multiple street lights out on Main Road',
              status: 'In Progress',
              priority: 'Medium',
              category: 'Electricity',
              department: 'Electricity Department',
              location: 'Main Road, Sector 3',
              latitude: 28.6200,
              longitude: 77.2100,
              dateSubmitted: '2025-01-16',
              lastUpdated: '2025-01-19',
              assignedTo: 'John Smith',
              images: [],
              updates: [
                { date: '2025-01-16', status: 'Submitted', note: 'Complaint registered' },
                { date: '2025-01-17', status: 'In Progress', note: 'Technician dispatched' }
              ]
            },
            {
              id: 'COMP006',
              regNumber: 'REG006',
              title: 'Pothole Repair Needed',
              description: 'Large pothole causing traffic hazard',
              status: 'Pending',
              priority: 'High',
              category: 'Road Maintenance',
              department: 'Public Works',
              location: 'Highway Junction, Sector 1',
              latitude: 28.6300,
              longitude: 77.2150,
              dateSubmitted: '2025-01-15',
              lastUpdated: '2025-01-15',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-15', status: 'Submitted', note: 'Complaint registered' }
              ]
            },
            {
              id: 'COMP007',
              regNumber: 'REG007',
              title: 'Illegal Parking',
              description: 'Vehicles blocking emergency lane',
              status: 'Pending',
              priority: 'Medium',
              category: 'Traffic',
              department: 'Traffic Police',
              location: 'Hospital Road, Sector 5',
              latitude: 28.6250,
              longitude: 77.2200,
              dateSubmitted: '2025-01-14',
              lastUpdated: '2025-01-14',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-14', status: 'Submitted', note: 'Complaint registered' }
              ]
            },
            {
              id: 'COMP008',
              regNumber: 'REG008',
              title: 'Sewage Overflow',
              description: 'Sewage backing up in residential area',
              status: 'Pending',
              priority: 'Urgent',
              category: 'Sanitation',
              department: 'Sanitation Department',
              location: 'Residential Colony, Sector 6',
              latitude: 28.6350,
              longitude: 77.2250,
              dateSubmitted: '2025-01-13',
              lastUpdated: '2025-01-13',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-13', status: 'Submitted', note: 'Urgent complaint registered' }
              ]
            },
            // Lucknow Test Data - Various locations around Lucknow
            {
              id: 'COMP009',
              regNumber: 'REG009',
              title: 'Road Repair Needed',
              description: 'Potholes on Gomti Nagar Road',
              status: 'Pending',
              priority: 'High',
              category: 'Road Maintenance',
              department: 'Public Works',
              location: 'Gomti Nagar Road, Lucknow',
              latitude: 26.8529,
              longitude: 80.9462,
              dateSubmitted: '2025-01-12',
              lastUpdated: '2025-01-12',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-12', status: 'Submitted', note: 'High priority road repair needed' }
              ]
            },
            {
              id: 'COMP010',
              regNumber: 'REG010',
              title: 'Street Light Outage',
              description: 'Multiple street lights not working in Indira Nagar',
              status: 'In Progress',
              priority: 'Medium',
              category: 'Electricity',
              department: 'Electricity Department',
              location: 'Indira Nagar, Lucknow',
              latitude: 26.8640,
              longitude: 80.9320,
              dateSubmitted: '2025-01-11',
              lastUpdated: '2025-01-14',
              assignedTo: 'Lucknow Electric Team',
              images: [],
              updates: [
                { date: '2025-01-11', status: 'Submitted', note: 'Street light outage reported' },
                { date: '2025-01-12', status: 'In Progress', note: 'Technician assigned' }
              ]
            },
            {
              id: 'COMP011',
              regNumber: 'REG011',
              title: 'Water Supply Issue',
              description: 'Low water pressure in Alambagh area',
              status: 'Pending',
              priority: 'Medium',
              category: 'Water Supply',
              department: 'Water Department',
              location: 'Alambagh, Lucknow',
              latitude: 26.8100,
              longitude: 80.8900,
              dateSubmitted: '2025-01-10',
              lastUpdated: '2025-01-10',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-10', status: 'Submitted', note: 'Water pressure issue reported' }
              ]
            },
            {
              id: 'COMP012',
              regNumber: 'REG012',
              title: 'Illegal Dumping',
              description: 'Construction waste dumped on roadside',
              status: 'Resolved',
              priority: 'Low',
              category: 'Sanitation',
              department: 'Sanitation Department',
              location: 'Vijay Nagar, Lucknow',
              latitude: 26.8750,
              longitude: 80.9150,
              dateSubmitted: '2025-01-09',
              lastUpdated: '2025-01-15',
              assignedTo: 'Lucknow Sanitation',
              images: [],
              updates: [
                { date: '2025-01-09', status: 'Submitted', note: 'Illegal dumping reported' },
                { date: '2025-01-10', status: 'In Progress', note: 'Cleanup team dispatched' },
                { date: '2025-01-15', status: 'Resolved', note: 'Issue resolved' }
              ]
            },
            {
              id: 'COMP013',
              regNumber: 'REG013',
              title: 'Traffic Signal Malfunction',
              description: 'Traffic signal at Charbagh not working properly',
              status: 'Pending',
              priority: 'High',
              category: 'Traffic',
              department: 'Traffic Police',
              location: 'Charbagh, Lucknow',
              latitude: 26.8467,
              longitude: 80.9462,
              dateSubmitted: '2025-01-08',
              lastUpdated: '2025-01-08',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-08', status: 'Submitted', note: 'Traffic signal malfunction' }
              ]
            },
            {
              id: 'COMP014',
              regNumber: 'REG014',
              title: 'Park Maintenance',
              description: 'Overgrown grass and broken benches in Janeshwar Park',
              status: 'In Progress',
              priority: 'Low',
              category: 'Public Spaces',
              department: 'Parks Department',
              location: 'Janeshwar Park, Lucknow',
              latitude: 26.8580,
              longitude: 80.9250,
              dateSubmitted: '2025-01-07',
              lastUpdated: '2025-01-13',
              assignedTo: 'Lucknow Parks',
              images: [],
              updates: [
                { date: '2025-01-07', status: 'Submitted', note: 'Park maintenance needed' },
                { date: '2025-01-08', status: 'In Progress', note: 'Maintenance team assigned' }
              ]
            },
            {
              id: 'COMP015',
              regNumber: 'REG015',
              title: 'Power Outage',
              description: 'Frequent power cuts in Rajajipuram area',
              status: 'Pending',
              priority: 'High',
              category: 'Electricity',
              department: 'Electricity Department',
              location: 'Rajajipuram, Lucknow',
              latitude: 26.8350,
              longitude: 80.8850,
              dateSubmitted: '2025-01-06',
              lastUpdated: '2025-01-06',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-06', status: 'Submitted', note: 'Frequent power outages' }
              ]
            },
            {
              id: 'COMP016',
              regNumber: 'REG016',
              title: 'Drainage Problem',
              description: 'Blocked drainage causing water logging',
              status: 'Pending',
              priority: 'Urgent',
              category: 'Sanitation',
              department: 'Sanitation Department',
              location: 'Mahanagar, Lucknow',
              latitude: 26.8700,
              longitude: 80.9500,
              dateSubmitted: '2025-01-05',
              lastUpdated: '2025-01-05',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-05', status: 'Submitted', note: 'Urgent drainage issue' }
              ]
            },
            {
              id: 'COMP017',
              regNumber: 'REG017',
              title: 'Broken Footpath',
              description: 'Damaged footpath tiles on Hazratganj Road',
              status: 'Resolved',
              priority: 'Medium',
              category: 'Infrastructure',
              department: 'Public Works',
              location: 'Hazratganj, Lucknow',
              latitude: 26.8480,
              longitude: 80.9400,
              dateSubmitted: '2025-01-04',
              lastUpdated: '2025-01-12',
              assignedTo: 'Lucknow Infrastructure',
              images: [],
              updates: [
                { date: '2025-01-04', status: 'Submitted', note: 'Footpath damage reported' },
                { date: '2025-01-05', status: 'In Progress', note: 'Repair work started' },
                { date: '2025-01-12', status: 'Resolved', note: 'Footpath repaired' }
              ]
            },
            {
              id: 'COMP018',
              regNumber: 'REG018',
              title: 'Garbage Collection Delay',
              description: 'Garbage not collected for 3 days in Aminabad',
              status: 'In Progress',
              priority: 'Medium',
              category: 'Sanitation',
              department: 'Sanitation Department',
              location: 'Aminabad, Lucknow',
              latitude: 26.8450,
              longitude: 80.9350,
              dateSubmitted: '2025-01-03',
              lastUpdated: '2025-01-08',
              assignedTo: 'Lucknow Sanitation',
              images: [],
              updates: [
                { date: '2025-01-03', status: 'Submitted', note: 'Garbage collection delay' },
                { date: '2025-01-04', status: 'In Progress', note: 'Collection scheduled' }
              ]
            },
            {
              id: 'COMP019',
              regNumber: 'REG019',
              title: 'Street Sign Missing',
              description: 'Missing street sign at busy intersection',
              status: 'Pending',
              priority: 'Low',
              category: 'Traffic',
              department: 'Traffic Police',
              location: 'Aliganj, Lucknow',
              latitude: 26.8900,
              longitude: 80.9600,
              dateSubmitted: '2025-01-02',
              lastUpdated: '2025-01-02',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-02', status: 'Submitted', note: 'Missing street sign' }
              ]
            },
            {
              id: 'COMP020',
              regNumber: 'REG020',
              title: 'Public Toilet Maintenance',
              description: 'Public toilet in bad condition near bus stand',
              status: 'Pending',
              priority: 'Medium',
              category: 'Sanitation',
              department: 'Sanitation Department',
              location: 'Kaiserbagh Bus Stand, Lucknow',
              latitude: 26.8400,
              longitude: 80.9200,
              dateSubmitted: '2025-01-01',
              lastUpdated: '2025-01-01',
              assignedTo: 'Unassigned',
              images: [],
              updates: [
                { date: '2025-01-01', status: 'Submitted', note: 'Public toilet maintenance needed' }
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
      ]
    };
  }

  async persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to persist DB to storage.', e);
    }
  }

  aggregateComplaints(users) {
    return users.flatMap(user =>
      (user.complaints || []).map(complaint => ({
        ...complaint,
        userId: user.id,
        userName: user.fullName,
      }))
    );
  }

  // User operations
  async getUser(username) {
    await this.initialize();
    return this.data.users.find(user => user.username === username);
  }

  async getUserById(userId) {
    await this.initialize();
    return this.data.users.find(user => user.id === userId);
  }

  async getAllUsers() {
    await this.initialize();
    return this.data.users;
  }

  async addUser(userData) {
    await this.initialize();
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
    this.data.users.push(newUser);
    await this.persist();
    return newUser;
  }

  async updateUser(userId, changes) {
    await this.initialize();
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = { ...this.data.users[userIndex], ...changes };
    await this.persist();
    return this.data.users[userIndex];
  }

  async deleteUser(userId) {
    await this.initialize();
    this.data.users = this.data.users.filter(u => u.id !== userId);
    await this.persist();
  }

  // Admin operations
  async getAdmin(username) {
    await this.initialize();
    return this.data.admins.find(admin => admin.username === username);
  }

  async getAllAdmins() {
    await this.initialize();
    return this.data.admins;
  }

  async getAdminsByLevel(level) {
    await this.initialize();
    return this.data.admins.filter(admin => admin.level === level);
  }

  async addAdmin(adminData) {
    await this.initialize();
    const newAdmin = {
      id: `admin${Date.now()}`,
      ...adminData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.admins.push(newAdmin);
    await this.persist();
    return newAdmin;
  }

  async updateAdmin(adminId, changes) {
    await this.initialize();
    const adminIndex = this.data.admins.findIndex(a => a.id === adminId);
    if (adminIndex === -1) return null;

    this.data.admins[adminIndex] = { ...this.data.admins[adminIndex], ...changes };
    await this.persist();
    return this.data.admins[adminIndex];
  }

  async deleteAdmin(adminId) {
    await this.initialize();
    this.data.admins = this.data.admins.filter(a => a.id !== adminId);
    await this.persist();
  }

  // Complaint operations
  async getAllComplaints() {
    await this.initialize();
    return this.aggregateComplaints(this.data.users);
  }

  async getComplaintById(complaintId) {
    await this.initialize();
    const complaints = this.aggregateComplaints(this.data.users);
    return complaints.find(c => c.id === complaintId);
  }

  async getComplaintByRegNumber(regNumber) {
    await this.initialize();
    const complaints = this.aggregateComplaints(this.data.users);
    return complaints.find(c => c.regNumber === regNumber);
  }

  async getUserComplaints(userId) {
    await this.initialize();
    const user = this.data.users.find(u => u.id === userId);
    return user ? user.complaints : [];
  }

  async addComplaint(userId, complaintData) {
    await this.initialize();
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    const newComplaint = {
      id: `COMP${Date.now()}`,
      regNumber: `REG${Date.now().toString().slice(-3)}`,
      title: complaintData.title,
      description: complaintData.description,
      priority: complaintData.priority || 'Medium',
      category: complaintData.category,
      mainCategory: complaintData.mainCategory,
      subCategory1: complaintData.subCategory1,
      specificIssue: complaintData.specificIssue,
      city: complaintData.city,
      department: complaintData.department,
      location: complaintData.location,
      latitude: complaintData.latitude,
      longitude: complaintData.longitude,
      userDetails: complaintData.userDetails,
      attachments: complaintData.attachments || [],
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

    this.data.users[userIndex].complaints.push(newComplaint);
    await this.persist();
    return newComplaint;
  }

  async updateComplaint(complaintId, changes) {
    await this.initialize();
    for (const user of this.data.users) {
      const complaintIndex = user.complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        user.complaints[complaintIndex] = { ...user.complaints[complaintIndex], ...changes };
        await this.persist();
        return user.complaints[complaintIndex];
      }
    }
    return null;
  }

  async updateComplaintStatus(complaintId, newStatus, note = '') {
    await this.initialize();
    const updateData = {
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      updates: []
    };

    for (const user of this.data.users) {
      const complaintIndex = user.complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        const complaint = user.complaints[complaintIndex];
        updateData.updates = [
          ...complaint.updates,
          {
            date: new Date().toISOString().split('T')[0],
            status: newStatus,
            note: note || `Status updated to ${newStatus}`
          }
        ];
        user.complaints[complaintIndex] = { ...complaint, ...updateData };
        await this.persist();
        return user.complaints[complaintIndex];
      }
    }
    return null;
  }

  async deleteComplaint(complaintId) {
    await this.initialize();
    for (const user of this.data.users) {
      user.complaints = user.complaints.filter(c => c.id !== complaintId);
    }
    await this.persist();
  }

  // Analytics operations
  async getComplaintStats(filters = {}) {
    await this.initialize();
    const complaints = this.aggregateComplaints(this.data.users);

    let filteredComplaints = complaints;
    if (filters.status) {
      filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
    }
    if (filters.priority) {
      filteredComplaints = filteredComplaints.filter(c => c.priority === filters.priority);
    }
    if (filters.department) {
      filteredComplaints = filteredComplaints.filter(c => c.department === filters.department);
    }

    return {
      total: filteredComplaints.length,
      byStatus: this.groupBy(filteredComplaints, 'status'),
      byPriority: this.groupBy(filteredComplaints, 'priority'),
      byDepartment: this.groupBy(filteredComplaints, 'department')
    };
  }

  async getDepartmentStats() {
    await this.initialize();
    const complaints = this.aggregateComplaints(this.data.users);
    return this.groupBy(complaints, 'department');
  }

  async getPriorityStats() {
    await this.initialize();
    const complaints = this.aggregateComplaints(this.data.users);
    return this.groupBy(complaints, 'priority');
  }

  // Utility operations
  async clearAll() {
    this.data = this.getInitialData();
    await this.persist();
  }

  async exportData() {
    await this.initialize();
    return JSON.stringify(this.data, null, 2);
  }

  async importData(jsonData) {
    try {
      this.data = JSON.parse(jsonData);
      await this.persist();
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
