import { useState } from 'react';
import { useAuth, useDatabase } from '../../../contexts';
import { useNavigate } from 'react-router-dom';

function DeleteAccount() {
  const { user, logout } = useAuth();
  const { deleteUser, deleteAdmin } = useDatabase();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user || confirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const wasAdmin = user.role === 'admin';
      const ok = wasAdmin ? await deleteAdmin(user.id) : await deleteUser(user.id);
      if (!ok) {
        // Basic inline failure notice
        alert('Failed to delete account record.');
        return;
      }
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Delete account failed', e);
      alert('Unexpected error deleting account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px' }}>
        <h2>Delete Account</h2>
        <p>Warning: This action permanently deletes your profile data and associated complaints.</p>
        <div style={{
          marginTop: '12px',
          padding: '12px',
          border: '1px solid #f59e0b',
          background: 'rgba(245,158,11,0.08)',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.4
        }}>
          <strong>Note:</strong> Your authentication identity (email credential) in Supabase Auth is <em>not</em> removed here because a service role key / server function is required. To fully erase auth credentials, contact support or implement a secured edge function.
        </div>

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
            Type DELETE in uppercase to confirm. This cannot be undone.
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccount;
