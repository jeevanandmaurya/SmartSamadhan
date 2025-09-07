import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'admin'; // Fixed to admin
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user, usingSupabase } = useAuth();

  // Debug: Log user changes for troubleshooting
  useEffect(() => {
    if (user) {
      console.log('🔍 AdminLogin: User state changed:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasAdminRole: user.role === 'admin',
        fullName: user.fullName,
        user_metadata: user.user_metadata
      });

      // Navigate based on role
      if (user.role === 'admin') {
        console.log('🔍 AdminLogin: Redirecting to ADMIN DASHBOARD');
        navigate('/admin-dashboard', { replace: true });
      } else {
        console.log('🔍 AdminLogin: Would redirect to USER DASHBOARD (role mismatch)', user.role);
        // Don't navigate to user dashboard from admin login - this causes the glimpse
      }
    } else {
      console.log('🔍 AdminLogin: User is null');
    }
  }, [user, navigate]);

  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔍 AdminLogin: Starting login process for:', username);

    if (!username || !password) {
      setError(`Please enter your ${usingSupabase ? 'admin email' : 'username/email'} and password.`);
      return;
    }

    // Use auth context for authentication
    const success = await login(username, password);
    console.log('🔍 AdminLogin: Login result:', success);

    if (success) {
      console.log('🔍 AdminLogin: Login successful, waiting for user role determination...');
      setLoginSuccess(true);
      // Don't navigate immediately - let the useEffect handle navigation when user is updated
    } else {
      setError('Invalid credentials. Make sure you are using a registered admin email.');
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setRemember(true);
    setError('');
  };

  return (
    <div className="section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingTop: 16 }}>
      <div className="card auth-layout" style={{ overflow: 'hidden', maxWidth: 800, width: '100%', margin: '0 16px' }}>
        {/* Left: Form */}
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Admin/Officer Login</h2>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to SmartSamadhan</div>
          </div>

          {error && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#7f1d1d', marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loginSuccess && !user && (
            <div className="card" style={{ borderColor: '#3b82f6', background: '#eff6ff', color: '#1d4ed8', marginBottom: 12 }}>
              🔍 Authenticating... Checking your admin status and loading dashboard...
              <br/>
              <small>
                How we check admin status:
                <br/>• Step 1: Check if you exist in admins table
                <br/>• Step 2: Check if your metadata has is_admin=true
                <br/>• Step 3: Default to user role if neither found
              </small>
            </div>
          )}

          {user && user.role !== 'admin' && (
            <div className="card" style={{ borderColor: '#f97316', background: '#fff7ed', color: '#9a3412', marginBottom: 12 }}>
              ⚠️ Admin verification in progress... Current role: {user.role}
              <br/>
              <small>Checking admin privileges...</small>
            </div>
          )}

          {user && user.role === 'admin' && (
            <div className="card" style={{ borderColor: '#10b981', background: '#ecfdf5', color: '#064e3b', marginBottom: 12 }}>
              ✅ Admin verified! Redirecting to admin dashboard...
            </div>
          )}

      <form onSubmit={handleLogin} noValidate>
            {/* Username */}
            <div className="field">
              <label htmlFor="username">{usingSupabase ? 'Admin Email' : 'Username or Email'}</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder={usingSupabase ? 'admin@example.com' : 'Username | Email | Mobile No'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
        aria-required="true"
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
              <button type="submit" className="btn btn--primary" style={{ flex: '1 1 0' }} disabled={loginSuccess && !user}>Sign in</button>
              <button type="button" onClick={handleReset} className="btn" style={{ flex: '1 1 0' }}>Reset</button>
            </div>
          </form>

          {/* Links */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>User Login</a>
          </div>

          {/* Tip */}
          {usingSupabase && (
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
              Use your registered admin email & password. Admin role is determined by metadata (is_admin=true) or presence in admins table.
            </div>
          )}
        </div>

        {/* Right: Banner */}
        <div className="auth-banner" aria-hidden style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 18 }}>
          Admin Portal
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
