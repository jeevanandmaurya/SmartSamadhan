import { useState, useEffect } from 'react';
import { useAuth, useDatabase } from '../../../contexts';
import { useTranslation } from 'react-i18next';

function EditProfile() {
  const { t } = useTranslation('user');
  const { user, refreshProfile } = useAuth();
  const { getUserById, updateUser, getAdminById, updateAdmin, getUserComplaints } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isUser, setIsUser] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      try {
        const isUserAccount = !user.permissionLevel?.startsWith('admin');
        setIsUser(isUserAccount);

        const userDetails = isUserAccount
          ? await getUserById(user.id)
          : await getAdminById(user.id);

        setUserData(userDetails);
        setFormData({
          fullName: userDetails?.fullName || user.fullName || '',
          email: userDetails?.email || user.email || '',
          phone: userDetails?.phone || user.phone || '',
          address: userDetails?.address || ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, [user, getUserById, getAdminById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUser) return; // Admins should not use this form to update
    setIsLoading(true);

    try {
      const changes = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const updated = isUser
        ? await updateUser(user.id, changes)
        : await updateAdmin(user.id, changes);

      if (updated) {
        await refreshProfile();
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  };

  // Simplified stats (fetch fresh each render for now; could cache with state)
  const [complaints, setComplaints] = useState([]);
  useEffect(() => {
    if (!user || !isUser) return;
    (async () => {
      try {
        const list = await getUserComplaints(user.id);
        setComplaints(list || []);
      } catch (e) {
        console.warn('Failed loading user complaints for stats', e);
      }
    })();
  }, [user, isUser, getUserComplaints]);
  const userDataComplaintsLength = complaints.length;
  const userDataStatusCount = (status) => complaints.filter(c => c.status === status).length;

  if (!user) {
    return (
      <div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <p>{t('loginToEditProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: '14px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{t('editProfile')}</h2>
        <p style={{ fontSize: '12px', margin: 0 }}>{t('editProfileDescription')}</p>
      </div>

      {isSaved && (
        <div className="card" style={{
          padding: '10px',
          marginBottom: '14px',
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          color: '#065f46',
          fontSize: '12px'
        }}>
          {t('profileUpdated')}
        </div>
      )}

    <div className="card" style={{ padding: '14px' }}>
        <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '12px' }}>

            {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
              <div style={{
        width: '60px',
        height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
        fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {(formData.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
        <h3 style={{ margin: '0 0 2px 0', fontSize: '16px' }}>{user.fullName}</h3>
        <p style={{ margin: '0', color: 'var(--muted)', fontSize: '12px' }}>@{user.username}</p>
        <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                  {t('memberSince')} {new Date(user.createdAt || '2025-01-01').toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: 'var(--fg)', fontSize: '12px' }}>{t('fullNameLabel')}</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={t('fullNamePlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: 'var(--fg)', fontSize: '12px' }}>{t('emailLabel')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('emailPlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: 'var(--fg)', fontSize: '12px' }}>{t('phoneLabel')}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('phonePlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: 'var(--fg)', fontSize: '12px' }}>{t('addressLabel')}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={t('addressPlaceholder')}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Account Information (Read-only) */}
            <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: '13px' }}>{t('accountInfo')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>{t('usernameLabel')}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{user.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>{t('userIdLabel')}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{user.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>{t('accountTypeLabel')}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{user.permissionLevel?.startsWith('admin') ? t('administrator') : t('citizen')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>{t('memberSinceLabel')}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{new Date(user.createdAt || '2025-01-01').toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isLoading ? 'var(--muted)' : 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t('resetChanges')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Profile Statistics */}
      <div className="card" style={{ padding: '14px', marginTop: '14px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>{t('activitySummary')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{t('total')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {userDataComplaintsLength}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px', color: '#10b981' }}>✅</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{t('resolved')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
              {userDataStatusCount('Resolved')}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px', color: '#f59e0b' }}>⏳</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{t('progress')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
              {userDataStatusCount('In Progress')}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px', color: '#ef4444' }}>⏸️</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{t('pending')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
              {userDataStatusCount('Pending')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
