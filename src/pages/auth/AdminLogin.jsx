import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts';

function AdminLogin() {
  const { t } = useTranslation('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAdmin, user, usingSupabase } = useAuth();

  // Debug: Log user changes for troubleshooting
  useEffect(() => {
    if (user) {
      console.log('🔍 AdminLogin: User state changed:', {
        id: user.id,
        email: user.email,
        permissionLevel: user.permissionLevel,
        hasAdminPermissions: user.permissionLevel?.startsWith('admin'),
        fullName: user.fullName,
        meta: user.meta
      });

      // Navigate based on permission level
      if (user.permissionLevel?.startsWith('admin')) {
        console.log('🔍 AdminLogin: Redirecting to ADMIN DASHBOARD');
        navigate('/admin-dashboard', { replace: true });
      } else {
        console.log('🔍 AdminLogin: Would redirect to USER DASHBOARD (permission mismatch)', user.permissionLevel);
        // Don't navigate to user dashboard from admin login - this causes the glimpse
      }
    } else {
      console.log('🔍 AdminLogin: User is null');
    }
  }, [user, navigate]);

  const [loginStep, setLoginStep] = useState('idle'); // 'idle' | 'authenticating' | 'verifying' | 'complete'

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginStep('authenticating');
    console.log('🔍 AdminLogin: Starting admin login process for:', username);

    if (!username || !password) {
      setError(t('enterCredentials', { credential: usingSupabase ? t('adminEmail') : t('usernameOrEmail') }));
      setLoginStep('idle');
      return;
    }

    try {
      const { data, error } = await loginAdmin(username, password);

      if (error) {
        setError(error.message || t('invalidCredentials'));
        setLoginStep('idle');
      } else if (data) {
        setLoginStep('complete');
        console.log('🔍 AdminLogin: Admin authentication successful, navigating...');
        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('🔍 AdminLogin: Login error:', error);
      setError(t('loginFailed') + error.message);
      setLoginStep('idle');
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
            <h2 style={{ margin: 0 }}>{t('adminLogin')}</h2>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t('welcomeBack')}</div>
          </div>

          {error && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#7f1d1d', marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loginStep === 'authenticating' && (
            <div className="card" style={{ borderColor: '#3b82f6', background: '#eff6ff', color: '#1d4ed8', marginBottom: 12 }}>
              🔐 {t('authenticating')}
            </div>
          )}

          {loginStep === 'verifying' && (
            <div className="card" style={{ borderColor: '#f59e0b', background: '#fffbeb', color: '#92400e', marginBottom: 12 }}>
              🛡️ {t('verifyingAdmin')}
              <br/>
              <small>{t('verifyingAdmin')}</small>
            </div>
          )}

          {loginStep === 'complete' && user?.permissionLevel?.startsWith('admin') && (
            <div className="card" style={{ borderColor: '#10b981', background: '#ecfdf5', color: '#064e3b', marginBottom: 12 }}>
              ✅ {t('adminVerified')}
            </div>
          )}

          {loginStep === 'complete' && !user?.permissionLevel?.startsWith('admin') && (
            <div className="card" style={{ borderColor: '#ef4444', background: '#fef2f2', color: '#991b1b', marginBottom: 12 }}>
              ❌ {t('adminDenied')}
              <br/>
              <small>{t('adminDeniedNote')}</small>
            </div>
          )}

      <form onSubmit={handleLogin} noValidate>
            {/* Username */}
            <div className="field">
              <label htmlFor="username">{usingSupabase ? t('adminEmail') : t('usernameOrEmail')}</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder={usingSupabase ? t('adminEmail') : t('usernameOrEmail')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                aria-required="true"
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
                  placeholder={t('password')}
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
              <button type="submit" className="btn btn--primary" style={{ flex: '1 1 0' }} disabled={loginStep !== 'idle'}>{t('signIn')}</button>
              <button type="button" onClick={handleReset} className="btn" style={{ flex: '1 1 0' }}>{t('cancel')}</button>
            </div>
          </form>

          {/* Links */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('backToHome')}</a>
          </div>

          {/* Tip */}
          {usingSupabase && (
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
              {t('adminTip')}
            </div>
          )}
        </div>

        {/* Right: Banner */}
        <div className="auth-banner" aria-hidden style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 18 }}>
          {t('adminPortal')}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
