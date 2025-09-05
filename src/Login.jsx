import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'user'; // Fixed to user
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    // Basic mock authentication
    if (username === 'user' && password === 'pass') {
      navigate('/user-dashboard');
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
    <div className="auth" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <div className="card auth-grid" style={{ overflow: 'hidden' }}>
        {/* Left: Form */}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Welcome back</h2>
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
              <div className="input-row">
                <span className="input-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="username"
                  className="input input-with-icon"
                  type="text"
                  placeholder="Username | Email | Mobile No"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-row">
                <span className="input-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  className="input input-with-icon"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ghost-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="2">
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

          {/* Link to Admin Login */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/admin-login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Admin/Officer Login</a>
          </div>

          {/* Tip */}
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            Try user/pass.
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

export default Login;
