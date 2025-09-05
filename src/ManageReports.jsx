import { useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from './DatabaseContext';

function ManageReports() {
  const { user } = useAuth();
  const { getAllComplaints, updateComplaintStatus } = useDatabase();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const allComplaints = getAllComplaints();

  const filteredComplaints = useMemo(() => {
    return allComplaints.filter(complaint => {
      const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || complaint.department === filterDepartment;
      const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
      const matchesSearch = !searchTerm ||
        complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.mainCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.subCategory1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.specificIssue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesDepartment && matchesPriority && matchesSearch;
    });
  }, [allComplaints, filterStatus, filterDepartment, filterPriority, searchTerm]);

  const departments = [...new Set(allComplaints.map(c => c.department))];
  const priorities = ['High', 'Medium', 'Low', 'Urgent'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      case 'Urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus, `Status updated by ${user.fullName}`);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>Advanced Report Management</h2>
        <p>Filter, search, and manage all complaint reports efficiently.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Filters & Search</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)'
              }}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)'
              }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)'
              }}
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Search</label>
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)'
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Showing {filteredComplaints.length} of {allComplaints.length} reports
        </div>
      </div>

      {/* Reports List */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Reports ({filteredComplaints.length})</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export Filtered
            </button>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Bulk Actions
            </button>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            No reports match the current filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredComplaints.map((report) => (
              <div
                key={report.id}
                className="card"
                style={{
                  padding: '15px',
                  borderLeft: `5px solid ${getStatusColor(report.status)}`
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{report.title || report.description}</h4>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted)', fontSize: '14px' }}>
                      {report.description || report.title}
                    </p>
                    {report.mainCategory && (
                      <div style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--primary)' }}>
                        📂 {report.mainCategory} → {report.subCategory1} → {report.specificIssue}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                      <span>📋 {report.regNumber}</span>
                      <span>🏢 {report.department}</span>
                      <span>👤 {report.userName}</span>
                      <span>📅 {new Date(report.dateSubmitted).toLocaleDateString()}</span>
                      {report.city && <span>📍 {report.city}</span>}
                      {report.attachments > 0 && <span>📎 {report.attachments} files</span>}
                    </div>
                    {report.location && (
                      <div style={{ marginTop: '5px', fontSize: '12px', color: 'var(--muted)' }}>
                        📍 {report.location}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: getPriorityColor(report.priority),
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        {report.priority}
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(report.status),
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        defaultValue={report.status}
                        disabled={updatingId === report.id}
                        onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--fg)',
                          fontSize: '12px'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <button
                        disabled={updatingId === report.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: updatingId === report.id ? 'var(--muted)' : 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: updatingId === report.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {updatingId === report.id ? '...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageReports;
