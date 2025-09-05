import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'
    }}>
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
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--fg)',
                    textDecoration: 'underline'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Not logged in options
              <>
                <Link to="/login" style={{ color: 'var(--fg)' }}>Sign In</Link>
                <Link to="/admin-login" style={{ color: 'var(--fg)' }}>Admin</Link>
              </>
            )}

            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--fg)' }}>
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--fg)' }}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--fg)',
                padding: '8px'
              }}
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
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    backgroundColor: 'var(--card)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--fg)',
                    textDecoration: 'underline',
                    textAlign: 'left',
                    padding: '12px 20px',
                    width: '100%',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card)'}
                >
                  Sign Out
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
  );
}

export default Navbar;
