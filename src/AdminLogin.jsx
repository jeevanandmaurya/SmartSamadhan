import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'admin'; // Fixed to admin
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    // Use auth context for authentication
    const success = await login(username, password, role);
    if (success) {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setRemember(true);
    setError('');
  };

  return (
    <div className="auth" style={{
      paddingTop: 12,
      paddingBottom: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div className="card auth-grid" style={{
        overflow: 'hidden',
        maxWidth: '800px',
        width: '100%',
        margin: '20px'
      }}>
        {/* Left: Form */}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Admin/Officer Login</h2>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to SmartSamadhan</div>
          </div>

          {error && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#7f1d1d', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="field">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder="Username | Email | Mobile No"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--muted)'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" onClick={(e)=>e.preventDefault()}>Forgot password?</a>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" style={{ flex: '1 1 0', background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}>Sign in</button>
              <button type="button" onClick={handleReset} style={{ flex: '1 1 0' }}>Reset</button>
            </div>
          </form>

          {/* Links */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>User Login</a>
          </div>

          {/* Tip */}
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            Try admin/pass.
          </div>
        </div>

        {/* Right: Banner */}
        <div className="auth-banner" aria-hidden>
          {/* Decorative panel */}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
