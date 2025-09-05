import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();

  const reports = [
    { id: '12345', issue: 'Pothole on Main St', status: 'In Progress', date: '2025-01-15' },
    { id: '67890', issue: 'Broken Streetlight', status: 'Resolved', date: '2025-01-10' },
    { id: '11111', issue: 'Trash Bin Overflow', status: 'Pending', date: '2025-01-20' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>User Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>Welcome, Citizen!</h2>
        <p>Here you can submit new reports and track the status of your existing civic issue reports.</p>
        <button
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Submit New Report
        </button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3>Your Reports</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              className="card"
              style={{
                padding: '15px',
                borderLeft: `5px solid ${getStatusColor(report.status)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{report.issue}</h4>
                <p style={{ margin: '0', color: 'var(--muted)' }}>ID: {report.id} | Date: {report.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    backgroundColor: getStatusColor(report.status),
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
