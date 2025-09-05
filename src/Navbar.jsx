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

  useEffect(() => {
    // Apply the theme to the document on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
            <Link to="/login" style={{ color: 'var(--fg)' }}>Sign In</Link>
          )}

          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--fg)' }}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
