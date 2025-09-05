import { useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from './DatabaseContext';

function AdminDashboardHome() {
  const { user } = useAuth();
  const { getAllComplaints, updateComplaintStatus } = useDatabase();
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({});

  const allComplaints = getAllComplaints();

  const analytics = useMemo(() => {
    const total = allComplaints.length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    return { total, resolved, pending, inProgress };
  }, [allComplaints]);

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
      default: return '#6b7280';
    }
  };

  return (
    <div>
      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Total Reports</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{analytics.total}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#10b981' }}>Resolved</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{analytics.resolved}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{analytics.inProgress}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{analytics.pending}</p>
        </div>
      </div>

      {/* Reports Management */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>All Reports</h3>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Export Reports
          </button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {allComplaints.map((report) => (
            <div
              key={report.id}
              className="card"
              style={{
                padding: '15px',
                borderLeft: `5px solid ${getStatusColor(report.status)}`,
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{report.title || report.issue}</h4>
                <p style={{ margin: '0', color: 'var(--muted)' }}>
                  ID: {report.regNumber} | Department: {report.department} | User: {report.userName}
                </p>
              </div>
              <span
                style={{
                  padding: '5px 10px',
                  borderRadius: '15px',
                  backgroundColor: getPriorityColor(report.priority),
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {report.priority}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={pendingStatus[report.id] ?? report.status}
                  onChange={(e) => setPendingStatus(ps => ({ ...ps, [report.id]: e.target.value }))}
                  disabled={updatingId === report.id}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <button
                  onClick={async () => {
                    const newStatus = pendingStatus[report.id] ?? report.status;
                    if (newStatus === report.status) return;
                    setUpdatingId(report.id);
                    try {
                      await new Promise(r => setTimeout(r, 300));
                      updateComplaintStatus(report.id, newStatus);
                    } finally {
                      setUpdatingId(null);
                    }
                  }}
                  disabled={updatingId === report.id}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: updatingId === report.id ? 'var(--muted)' : 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: updatingId === report.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {updatingId === report.id ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;
