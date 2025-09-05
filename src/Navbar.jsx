import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'
    }}>
      <nav className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
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
          <Link to="/login" style={{ color: 'var(--fg)' }}>Sign In</Link>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--fg)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
