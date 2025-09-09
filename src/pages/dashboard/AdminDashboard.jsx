import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts';
import AdminDashboardHome from './AdminDashboardHome';
import ManageReports from '../../features/complaints/components/ManageReports';
import UserManagement from '../../pages/admin/UserManagement';
import AdminSettings from '../../pages/admin/AdminSettings';

function AdminDashboard() {
  const { t } = useTranslation('admin');
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
    { id: 'dashboard', label: t('dashboard'), icon: 'fas fa-tachometer-alt' },
    { id: 'manage-reports', label: t('manageReports'), icon: 'fas fa-clipboard-list' },
    { id: 'user-management', label: t('userManagement'), icon: 'fas fa-users' },
    { id: 'settings', label: t('settings'), icon: 'fas fa-cog' },
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
    try {
      console.log('🔍 AdminDashboard: Starting logout process');
      await logout();
      console.log('🔍 AdminDashboard: Logout completed, navigating to home');
      navigate('/', { replace: true });
      setShowSignoutConfirm(false);
    } catch (error) {
      console.error('🔍 AdminDashboard: Logout error:', error);
      // Fallback: even if logout fails, navigate away
      navigate('/', { replace: true });
      setShowSignoutConfirm(false);
    }
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile hamburger */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          aria-label={t('openNavigation')}
          style={{
            position: 'fixed', top: 70, left: 0, zIndex: 1100,
            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0 6px 6px 0',
            padding: '10px 14px', cursor: 'pointer', fontSize: 18
          }}>☰</button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          padding: '20px 0',
          position: 'fixed',
          top: isMobile ? 0 : '60px',
          left: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
          height: isMobile ? '100vh' : 'calc(100vh - 60px)',
          overflowY: 'auto',
          zIndex: 1050,
          transition: 'left .3s ease',
          boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,.15)' : 'none'
        }}
      >
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: 20, color: 'var(--primary)' }}>{t('adminPanel')}</h2>
        </div>
        <nav style={{ marginTop: 8 }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              style={{
                width: '100%',
                padding: '8px 14px',
                background: activeSection === item.id ? 'var(--primary)' : 'transparent',
                color: activeSection === item.id ? '#fff' : 'var(--fg)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1.2,
                textAlign: 'left',
                transition: 'background .2s, color .2s'
              }}
            >
              <i className={item.icon} style={{ width: 18 }}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000 }}
        />
      )}

      {/* Main content */}
      <main
        style={{
          flex: 1,
            marginLeft: isMobile ? 0 : 250,
          padding: '24px 24px 40px',
          width: '100%',
          maxWidth: '100%',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>

      {/* Signout modal */}
      {showSignoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="card" style={{ padding: 32, maxWidth: 420, width: '92%' }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--primary)' }}>{t('confirmSignOut')}</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: 14 }}>{t('signOutMessage')}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleSignoutConfirm} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{t('signOut')}</button>
              <button onClick={() => setShowSignoutConfirm(false)} style={{ background: 'var(--muted)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 6, cursor: 'pointer' }}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
