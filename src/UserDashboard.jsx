import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import DashboardHome from './DashboardHome';
import LodgeComplain from './LodgeComplain';
import EditProfile from './EditProfile';
import DeleteAccount from './DeleteAccount';
import ViewStatus from './ViewStatus';

function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'view-status', label: 'View Status', icon: '📊' },
    { id: 'lodge-complain', label: 'Lodge Complain', icon: '📄' },
    { id: 'edit-profile', label: 'Edit Profile', icon: '⚙' },
    { id: 'delete-account', label: 'Delete Account', icon: '🗑' },
    { id: 'signout', label: 'Sign Out', icon: '↗' }
  ];

  const handleMenuClick = (sectionId) => {
    if (sectionId === 'signout') {
      setShowSignoutConfirm(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleSignoutConfirm = () => {
    logout();
    navigate('/');
    setShowSignoutConfirm(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'view-status':
        return <ViewStatus />;
      case 'lodge-complain':
        return <LodgeComplain />;
      case 'edit-profile':
        return <EditProfile />;
      case 'delete-account':
        return <DeleteAccount />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: 'var(--card-bg)',
        borderRight: '1px solid var(--border)',
        padding: '20px 0'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ margin: '0', color: 'var(--primary)' }}>User Panel</h2>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: activeSection === item.id ? 'var(--primary)' : 'transparent',
                color: activeSection === item.id ? '#fff' : 'var(--fg)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '100%', padding: '0 10px' }}>
          {renderContent()}
        </div>
      </div>

      {/* Signout Confirmation Modal */}
      {showSignoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)' }}>Confirm Sign Out</h3>
            <p style={{ margin: '0 0 30px 0', color: 'var(--muted)' }}>
              Are you sure you want to sign out? You will need to log in again to access your dashboard.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleSignoutConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowSignoutConfirm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--muted)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
