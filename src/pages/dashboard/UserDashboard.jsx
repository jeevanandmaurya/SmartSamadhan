import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts';
import DashboardHome from './DashboardHome';
// Updated paths after modularization into features directory
import LodgeComplain from '../../features/complaints/components/LodgeComplain';
import ViewStatus from '../../features/complaints/components/ViewStatus';
import EditProfile from '../../features/users/components/EditProfile';
import DeleteAccount from '../../features/users/components/DeleteAccount';

function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
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
    { id: 'dashboard', label: t('dashboard'), icon: 'fas fa-home' },
    { id: 'view-status', label: t('user:viewStatus'), icon: 'fas fa-chart-bar' },
    { id: 'lodge-complain', label: t('user:lodgeComplain'), icon: 'fas fa-file-alt' },
    { id: 'edit-profile', label: t('user:editProfile'), icon: 'fas fa-cog' },
    { id: 'delete-account', label: t('user:deleteAccount'), icon: 'fas fa-trash' },
    { id: 'signout', label: t('signOut'), icon: 'fas fa-sign-out-alt' }
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

  const handleSignoutConfirm = async () => {
    await logout();
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
      {/* Hamburger Button for Mobile */}
  {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            // Positioned below the top navbar/title so it doesn't cover "Smart Samadhan"
            top: '60px',
            // Flush to left edge as requested
            left: 0,
            zIndex: 1001,
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '0 6px 6px 0',
            padding: '15px 8px',
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
        position: isMobile ? 'fixed' : 'fixed',
        left: isMobile ? (sidebarOpen ? '0' : '-100%') : '0',
        top: isMobile ? '0' : '60px',
        height: isMobile ? '100vh' : 'calc(100vh - 60px)',
  // zIndex was below the overlay (999) which made the sidebar unclickable on mobile.
  // Raise above overlay similar to AdminDashboard (>=1050) so interactions work.
  zIndex: 1050,
        transition: 'left 0.3s ease',
        display: isMobile && !sidebarOpen ? 'none' : 'block',
        boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none',
        opacity: 1,
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ margin: '0', color: 'var(--primary)' }}>{t('user:userPanel')}</h2>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              style={{
                width: '100%',
                // Compacted padding for better vertical density
                padding: '8px 14px',
                backgroundColor: activeSection === item.id ? 'var(--primary)' : 'transparent',
                color: activeSection === item.id ? '#fff' : 'var(--fg)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                lineHeight: 1.2,
                transition: 'background .2s, color .2s'
              }}
            >
              <i className={item.icon}></i>
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
        marginLeft: isMobile ? 0 : '250px'
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
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)' }}>{t('confirmSignOut')}</h3>
            <p style={{ margin: '0 0 30px 0', color: 'var(--muted)' }}>
              {t('signOutMessage')}
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
                {t('signOut')}
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
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
