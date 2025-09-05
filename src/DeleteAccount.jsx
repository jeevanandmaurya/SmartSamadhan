import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from './DatabaseContext';
import { useNavigate } from 'react-router-dom';

function DeleteAccount() {
  const { user, logout } = useAuth();
  const { deleteUser } = useDatabase();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      deleteUser(user.id);
      logout();
      navigate('/');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px' }}>
        <h2>Delete Account</h2>
        <p>Warning: This action cannot be undone. All your data will be permanently deleted.</p>

        <div style={{ marginTop: '20px', display: 'grid', gap: '12px', maxWidth: '480px' }}>
          <label style={{ fontWeight: 'bold' }}>Type DELETE to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            style={{
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg)',
              color: 'var(--fg)'
            }}
          />

          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            style={{
              padding: '12px 24px',
              backgroundColor: confirmText !== 'DELETE' || isDeleting ? 'var(--muted)' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: confirmText !== 'DELETE' || isDeleting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </button>

          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            This will remove your profile and all complaints associated with it.
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccount;
