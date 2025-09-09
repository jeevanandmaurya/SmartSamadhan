import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts';

function Signup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.fullName || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signup(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });

      if (error) {
        setError(error.message || 'Failed to create account');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => { navigate('/login'); }, 1200);

    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      address: ''
    });
    setError('');
  };

  if (isSuccess) {
    return (
      <div className="section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="card" style={{ maxWidth: 420, width: '100%', margin: '0 16px', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{t('signupSuccess')}</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            {t('signupSuccess')}
          </p>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Redirecting in a few seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingTop: 16 }}>
      <div className="card auth-layout" style={{ overflow: 'hidden', maxWidth: 920, width: '100%', margin: '0 16px' }}>
        {/* Left: Form */}
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>{t('signup')}</h2>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t('welcomeMessage')}</div>
          </div>

          {error && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#7f1d1d', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

            {/* Full Name */}
            <div className="field">
              <label htmlFor="fullName">{t('fullName')} *</label>
              <input
                id="fullName"
                className="input"
                type="text"
                placeholder={t('fullName')}
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Username */}
            <div className="field">
              <label htmlFor="username">{t('username')} *</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder={t('username')}
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">{t('email')} *</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder={t('email')}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <div className="field">
              <label htmlFor="phone">{t('phone')} *</label>
              <input
                id="phone"
                className="input"
                type="tel"
                placeholder={t('phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                autoComplete="tel"
              />
            </div>

            {/* Address */}
            <div className="field">
              <label htmlFor="address">{t('address')}</label>
              <textarea
                id="address"
                className="input"
                placeholder={t('address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">{t('password')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="field">
              <label htmlFor="confirmPassword">{t('confirmPassword')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  className="input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmPassword')}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn--primary"
                style={{ flex: '1 1 0', opacity: isLoading ? 0.8 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {isLoading ? t('loading') : t('signup')}
              </button>
              <button type="button" onClick={handleReset} className="btn" style={{ flex: '1 1 0' }}>{t('cancel')}</button>
            </div>
          </form>

          {/* Links */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('login')}</a>
          </div>

          {/* Password Requirements */}
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            Password must be at least 6 characters long.
          </div>
        </div>

        {/* Right: Banner */}
        <div className="auth-banner" aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc'}}>
          <img
            src="/images/signuplong.svg"
            alt="Signup Illustration"
            style={{ width: '100%'}}
          />
        </div>
      </div>
    </div>
  );
}

export default Signup;
