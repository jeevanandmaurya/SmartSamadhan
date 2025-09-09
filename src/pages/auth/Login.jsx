import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts';

function Login() {
  const { t } = useTranslation('common');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser, user, usingSupabase } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.permissionLevel?.startsWith('admin') ? '/admin-dashboard' : '/user-dashboard');
    }
  }, [user, navigate]);

  // Handle hash navigation to form
  useEffect(() => {
    if (window.location.hash === '#form') {
      const formElement = document.getElementById('login-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus on the first input field
        const firstInput = formElement.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(`${t('loginError')} ${usingSupabase ? t('email') : t('usernameOrEmail')} ${t('andPassword')}`);
      return;
    }

    try {
      console.log('[Login] Starting user authentication...');
      const { data, error } = await loginUser(username, password);

      if (error) {
        setError(error.message || t('invalidCredentials'));
      } else if (data) {
        console.log('[Login] User authentication successful, navigating...');
        const target = data.permissionLevel?.startsWith('admin') ? '/admin-dashboard' : '/user-dashboard';
        navigate(target, { replace: true });
      }
    } catch (error) {
      console.error('[Login] Login error:', error);
      setError(error.message || t('loginFailed'));
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setRemember(true);
    setError('');
  };

  return (
    <div className="section gradient-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingTop: 16 }}>
      <div className="card auth-layout glass-card neon-edge lift" style={{ overflow: 'hidden', maxWidth: 800, width: '100%', margin: '0 16px' }}>
        {/* Left: Form */}
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 className="gradient-text" style={{ margin: 0 }}>{t('welcome')}</h2>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t('login')} {t('loginToSmartSamadhan')} {usingSupabase && t('supabaseIndicator')}</div>
          </div>

          {error && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#7f1d1d', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin}>


            {/* Username */}
            <div className="field">
              <label htmlFor="username">{usingSupabase ? t('email') : t('email')}</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder={usingSupabase ? t('emailPlaceholder') : t('usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
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
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  title={showPassword ? t('hidePassword') : t('showPassword')}
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
                {t('rememberMe')}
              </label>
              <a href="#" onClick={(e)=>e.preventDefault()}>{t('forgotPassword')}</a>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="btn btn--primary" style={{ flex: '1 1 0' }}>{t('login')}</button>
              <button type="button" onClick={handleReset} className="btn" style={{ flex: '1 1 0' }}>{t('cancel')}</button>
            </div>
          </form>

          {/* Links */}
          <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('signup')}</a>
            <a href="/admin-login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('admin')} {t('login')}</a>
          </div>

          {/* Tip */}
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            {usingSupabase ? t('supabaseTip') : t('localTip')}
          </div>
        </div>

        {/* Right: Banner */}
        <div className="auth-banner" aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc'}}>
          <img
            src="/images/login.svg"
            alt="Login Illustration"
            style={{ width: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
