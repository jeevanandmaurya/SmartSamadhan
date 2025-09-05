import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AdminDashboardHome from './AdminDashboardHome';
import ManageReports from './ManageReports';
import UserManagement from './UserManagement';
import AdminSettings from './AdminSettings';

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'manage-reports', label: 'Manage Reports', icon: '📋' },
    { id: 'user-management', label: 'User Management', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
    { id: 'signout', label: 'Sign Out', icon: '↗' }
  ];

  const handleMenuClick = (sectionId) => {
    if (sectionId === 'signout') {
      setShowSignoutConfirm(true);
    } else {
      setActiveSection(sectionId);
    }
    if (isMobile) {
      setSidebarOpen(false);
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
        return <AdminDashboardHome />;
      case 'manage-reports':
        return <ManageReports />;
      case 'user-management':
        return <UserManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Hamburger Button for Mobile */}
  {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '80%' : '250px',
        backgroundColor: 'var(--card)',
        borderRight: isMobile ? 'none' : '1px solid var(--border)',
        borderRadius: isMobile ? '0 8px 8px 0' : '0',
        padding: '20px 0',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? '0' : '-100%') : 'auto',
        top: '0',
        height: '100vh',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        display: isMobile && !sidebarOpen ? 'none' : 'block',
        boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none',
        opacity: 1
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ margin: '0', color: 'var(--primary)' }}>Admin Panel</h2>
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

      {/* Overlay for Mobile */}
  {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        marginLeft: isMobile ? '0' : '0'
      }}>
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
              Are you sure you want to sign out? You will need to log in again to access the admin panel.
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

export default AdminDashboard;
