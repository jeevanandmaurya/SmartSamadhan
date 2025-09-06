import { useState, useEffect } from 'react';
import { useAuth, useDatabase } from '../../contexts';

function AdminSettings() {
  const { user } = useAuth();
  const { getAdmin, getAllUsers, getAllComplaints } = useDatabase();
  const [activeTab, setActiveTab] = useState('profile');
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [admin, allUsers, allComplaints] = await Promise.all([
          getAdmin(user.username),
          getAllUsers(),
          getAllComplaints()
        ]);
        setAdminData(admin);
        setUsers(allUsers);
        setComplaints(allComplaints);
      } catch (error) {
        console.error('Error loading admin settings data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAdmin, getAllUsers, getAllComplaints, user.username]);

  const systemStats = {
    totalUsers: users.length,
    totalComplaints: complaints.length,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
    pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
    inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 3: return '#ef4444';
      case 2: return '#f59e0b';
      case 1: return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAccessLevelName = (level) => {
    switch (level) {
      case 3: return 'State Level (Full Access)';
      case 2: return 'City Level (Limited Access)';
      case 1: return 'Sector Level (Basic Access)';
      default: return 'Unknown';
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>Admin Settings & System Information</h2>
        <p>Manage your profile, view system statistics, and configure preferences.</p>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ padding: '0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'system', label: 'System Stats', icon: '📊' },
            { id: 'permissions', label: 'Permissions', icon: '🔐' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--bg)',
                color: activeTab === tab.id ? '#fff' : 'var(--fg)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card" style={{ padding: '20px' }}>
        {activeTab === 'profile' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Admin Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {adminData?.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{adminData?.fullName}</h4>
                    <p style={{ margin: '0', color: 'var(--muted)' }}>{adminData?.role}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>USERNAME</div>
                    <div style={{ fontWeight: 'bold' }}>{adminData?.username}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>EMAIL</div>
                    <div>{adminData?.email}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>DEPARTMENT</div>
                    <div>{adminData?.department}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>LOCATION</div>
                    <div>{adminData?.location}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>MEMBER SINCE</div>
                    <div>{new Date(adminData?.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '15px' }}>Access Level</h4>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: '8px',
                  border: `2px solid ${getAccessLevelColor(adminData?.accessLevel)}`
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{
                      fontSize: '36px',
                      marginBottom: '10px',
                      color: getAccessLevelColor(adminData?.accessLevel)
                    }}>
                      {adminData?.accessLevel === 3 ? '👑' : adminData?.accessLevel === 2 ? '🏛️' : '🏘️'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                      Level {adminData?.accessLevel}
                    </div>
                    <div style={{ color: 'var(--muted)' }}>
                      {getAccessLevelName(adminData?.accessLevel)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>System Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>TOTAL USERS</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.totalUsers}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>📋</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>TOTAL COMPLAINTS</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.totalComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#10b981' }}>✅</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>RESOLVED</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{systemStats.resolvedComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#f59e0b' }}>⏳</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>IN PROGRESS</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{systemStats.inProgressComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#ef4444' }}>⏸️</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>PENDING</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{systemStats.pendingComplaints}</div>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>System Health</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>RESOLUTION RATE</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {systemStats.totalComplaints > 0
                      ? ((systemStats.resolvedComplaints / systemStats.totalComplaints) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>AVG COMPLAINTS/USER</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {systemStats.totalUsers > 0
                      ? (systemStats.totalComplaints / systemStats.totalUsers).toFixed(1)
                      : 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>SYSTEM STATUS</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>🟢 Online</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Access Permissions</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Your Permissions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {adminData?.permissions.map((permission, index) => (
                    <div key={index} style={{
                      padding: '10px',
                      backgroundColor: 'var(--card-bg)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'var(--primary)'
                    }}>
                      ✅ {permission.replace('_', ' ').toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Permission Levels</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Level 3 - State Admin</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Full system access and control</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.accessLevel === 3 ? '#ef4444' : '#e5e7eb',
                      color: adminData?.accessLevel === 3 ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.accessLevel === 3 ? 'Current' : 'Level 3'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Level 2 - City Admin</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>City-wide access and management</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.accessLevel === 2 ? '#f59e0b' : '#e5e7eb',
                      color: adminData?.accessLevel === 2 ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.accessLevel === 2 ? 'Current' : 'Level 2'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Level 1 - Sector Admin</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Sector-specific access only</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.accessLevel === 1 ? '#10b981' : '#e5e7eb',
                      color: adminData?.accessLevel === 1 ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.accessLevel === 1 ? 'Current' : 'Level 1'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>System Settings</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Notification Settings</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Email notifications for new complaints</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Status update notifications</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span>Weekly summary reports</span>
                  </label>
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>System Preferences</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Default View</label>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--fg)'
                    }}>
                      <option>Dashboard</option>
                      <option>Manage Reports</option>
                      <option>User Management</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Items Per Page</label>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--fg)'
                    }}>
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Account Settings</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Change Password
                  </button>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
