import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// Updated to use central contexts barrel export
import { useAuth } from '../../contexts';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  useEffect(() => {
    // Apply the theme to the document on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSignoutClick = () => {
    setShowSignoutConfirm(true);
  };

  const handleSignoutConfirm = async () => {
    await logout();
    navigate('/');
    setShowSignoutConfirm(false);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(6px)' }}>
        <nav className="container container--wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ fontWeight: 700, color: 'var(--fg)' }}>
              SmartSamadhan
            </Link>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>|</span>
            <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg)' }}>
              Government of India
            </a>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link to="/" style={{ color: 'var(--fg)' }}>Home</Link>
              <Link to="/about" style={{ color: 'var(--fg)' }}>About</Link>
              <Link to="/sitemap" style={{ color: 'var(--fg)' }}>Sitemap</Link>

              {user ? (
                // Logged in user options
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
                    style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignoutClick}
                    className="btn btn--outline"
                    style={{
                      padding: '6px 14px',
                      fontSize: 13
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in options
                <>
                  <Link to="/login" className="btn btn--outline" style={{ padding: '6px 14px', fontSize: 13 }}>Sign In</Link>
                  <Link to="/admin-login" className="btn" style={{ padding: '6px 14px', fontSize: 13 }}>Admin</Link>
                </>
              )}

                  <button onClick={toggleTheme} className="btn btn--ghost" style={{ padding: '6px 10px', fontSize: 16 }}>
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={toggleTheme}
                className="btn btn--ghost"
                style={{ fontSize: 16, padding: '6px 10px' }}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn--ghost"
                style={{ fontSize: 18, padding: '6px 10px' }}
              >
                ☰
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            left: 'auto',
            width: '200px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 99,
            padding: '0',
            opacity: 1
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--fg)',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  display: 'block',
                  backgroundColor: 'var(--card)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--fg)',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  display: 'block',
                  backgroundColor: 'var(--card)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
              >
                About
              </Link>
              <Link
                to="/sitemap"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--fg)',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  display: 'block',
                  backgroundColor: 'var(--card)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
              >
                Sitemap
              </Link>

              {user ? (
                // Logged in user options
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 'bold',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      display: 'block',
                      backgroundColor: 'var(--card)',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignoutClick();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn--outline"
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      display: 'block',
                      width: '90%',
                      textAlign: 'center',
                      margin: '0 auto 8px auto'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in options
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: 'var(--fg)',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      display: 'block',
                      backgroundColor: 'var(--card)',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/admin-login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: 'var(--fg)',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      display: 'block',
                      backgroundColor: 'var(--card)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
                  >
                    Admin
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

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
          zIndex: 1100
        }}>
          <div style={{
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
    </>
  );
}

export default Navbar;
