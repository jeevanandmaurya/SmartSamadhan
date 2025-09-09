import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDatabase } from '../../contexts';

function AdminSettings() {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const { getAdmin, getAdminById, getAllUsers, getAllComplaints } = useDatabase();
  const [activeTab, setActiveTab] = useState('profile');
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Prefer ID-based fetch (reliable) then fallback to username if needed
        const [adminById, allUsers, allComplaints] = await Promise.all([
          getAdminById(user.id),
          getAllUsers(),
          getAllComplaints()
        ]);
        const admin = adminById || await getAdmin(user.username);
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
  }, [getAdmin, getAdminById, getAllUsers, getAllComplaints, user.id, user.username]);

  const systemStats = {
    totalUsers: users.length,
    totalComplaints: complaints.length,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
    pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
    inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length
  };

  const getAccessLevelColor = (permissionLevel) => {
    switch (permissionLevel) {
      case 'admin_level_3': return '#ef4444';
      case 'admin_level_2': return '#f59e0b';
      case 'admin_level_1': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAccessLevelName = (permissionLevel) => {
    switch (permissionLevel) {
      case 'admin_level_3': return 'State Level (Full Access)';
      case 'admin_level_2': return 'City Level (Limited Access)';
      case 'admin_level_1': return 'Sector Level (Basic Access)';
      default: return 'Unknown';
    }
  };

  const getAccessLevelIcon = (permissionLevel) => {
    switch (permissionLevel) {
      case 'admin_level_3': return '👑';
      case 'admin_level_2': return '🏛️';
      case 'admin_level_1': return '🏘️';
      default: return '❓';
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>{t('adminSettingsTitle')}</h2>
        <p>{t('adminSettingsDescription')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ padding: '0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'profile', label: t('profile'), icon: '👤' },
            { id: 'system', label: t('systemStats'), icon: '📊' },
            { id: 'permissions', label: t('permissions'), icon: '🔐' },
            { id: 'settings', label: t('settings'), icon: '⚙️' }
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
            <h3 style={{ marginBottom: '20px' }}>{t('adminProfile')}</h3>
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
                    <p style={{ margin: '0', color: 'var(--muted)' }}>{adminData?.permissionLevel.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('username')}</div>
                    <div style={{ fontWeight: 'bold' }}>{adminData?.username}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('email')}</div>
                    <div>{adminData?.email}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('department')}</div>
                    <div>{adminData?.department}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('location')}</div>
                    <div>{adminData?.location}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('memberSince')}</div>
                    <div>{new Date(adminData?.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '15px' }}>{t('accessLevel')}</h4>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: '8px',
                  border: `2px solid ${getAccessLevelColor(adminData?.permissionLevel)}`
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{
                      fontSize: '36px',
                      marginBottom: '10px',
                      color: getAccessLevelColor(adminData?.permissionLevel)
                    }}>
                      {getAccessLevelIcon(adminData?.permissionLevel)}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {adminData?.permissionLevel.replace('admin_level_', 'Level ')}
                    </div>
                    <div style={{ color: 'var(--muted)' }}>
                      {getAccessLevelName(adminData?.permissionLevel)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>{t('systemStatistics')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('totalUsers')}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.totalUsers}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>📋</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('totalComplaints')}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.totalComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#10b981' }}>✅</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('resolved')}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{systemStats.resolvedComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#f59e0b' }}>⏳</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('inProgress')}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{systemStats.inProgressComplaints}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px', color: '#ef4444' }}>⏸️</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('pending')}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{systemStats.pendingComplaints}</div>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>{t('systemHealth')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('resolutionRate')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {systemStats.totalComplaints > 0
                      ? ((systemStats.resolvedComplaints / systemStats.totalComplaints) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('avgComplaintsUser')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {systemStats.totalUsers > 0
                      ? (systemStats.totalComplaints / systemStats.totalUsers).toFixed(1)
                      : 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('systemStatus')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{t('online')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>{t('accessPermissions')}</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>{t('permissionLevels')}</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{t('level3StateAdmin')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('fullSystemAccess')}</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.permissionLevel === 'admin_level_3' ? '#ef4444' : '#e5e7eb',
                      color: adminData?.permissionLevel === 'admin_level_3' ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.permissionLevel === 'admin_level_3' ? t('current') : 'Level 3'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{t('level2CityAdmin')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('cityWideAccess')}</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.permissionLevel === 'admin_level_2' ? '#f59e0b' : '#e5e7eb',
                      color: adminData?.permissionLevel === 'admin_level_2' ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.permissionLevel === 'admin_level_2' ? t('current') : 'Level 2'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{t('level1SectorAdmin')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('sectorSpecificAccess')}</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: adminData?.permissionLevel === 'admin_level_1' ? '#10b981' : '#e5e7eb',
                      color: adminData?.permissionLevel === 'admin_level_1' ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {adminData?.permissionLevel === 'admin_level_1' ? t('current') : 'Level 1'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>{t('systemSettings')}</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>{t('notificationSettings')}</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>{t('emailNotifications')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>{t('statusUpdateNotifications')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span>{t('weeklySummaryReports')}</span>
                  </label>
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>{t('systemPreferences')}</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{t('defaultView')}</label>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--fg)'
                    }}>
                      <option>{t('dashboard')}</option>
                      <option>{t('manageReports')}</option>
                      <option>{t('userManagement')}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{t('itemsPerPage')}</label>
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
                <h4 style={{ margin: '0 0 15px 0' }}>{t('accountSettings')}</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    {t('changePassword')}
                  </button>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    {t('exportData')}
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
