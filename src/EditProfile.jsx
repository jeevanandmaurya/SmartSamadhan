import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from './DatabaseContext';

function EditProfile() {
  const { user, updateSession } = useAuth();
  const { getUser, updateUser } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDetails = await getUser(user.username);
          setUserData(userDetails);
          setFormData({
            fullName: userDetails?.fullName || '',
            email: userDetails?.email || '',
            phone: userDetails?.phone || '',
            address: userDetails?.address || ''
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user, getUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Persist to database and session
      const updated = await updateUser(user.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      updateSession({
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  };

  if (!user) {
    return (
      <div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <p>Please log in to edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>Edit Profile</h2>
        <p>Update your personal information and preferences.</p>
      </div>

      {isSaved && (
        <div className="card" style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          color: '#065f46'
        }}>
          ✅ Profile updated successfully!
        </div>
      )}

      <div className="card" style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                {formData.fullName.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{user.fullName}</h3>
                <p style={{ margin: '0', color: 'var(--muted)' }}>@{user.username}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                  Member since: {new Date(user.createdAt || '2025-01-01').toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--fg)'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--fg)'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--fg)'
              }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--fg)'
              }}>
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Account Information (Read-only) */}
            <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Account Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>USERNAME</div>
                  <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>USER ID</div>
                  <div style={{ fontWeight: 'bold' }}>{user.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>ACCOUNT TYPE</div>
                  <div style={{ fontWeight: 'bold' }}>{user.role === 'user' ? 'Citizen Account' : 'Administrator'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>MEMBER SINCE</div>
                  <div style={{ fontWeight: 'bold' }}>{new Date(user.createdAt || '2025-01-01').toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoading ? 'var(--muted)' : 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Reset Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Profile Statistics */}
      <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Your Activity Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>📋</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>TOTAL COMPLAINTS</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {userData?.complaints?.length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px', color: '#10b981' }}>✅</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>RESOLVED</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {userData?.complaints?.filter(c => c.status === 'Resolved').length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px', color: '#f59e0b' }}>⏳</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>IN PROGRESS</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
              {userData?.complaints?.filter(c => c.status === 'In Progress').length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px', color: '#ef4444' }}>⏸️</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>PENDING</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
              {userData?.complaints?.filter(c => c.status === 'Pending').length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
