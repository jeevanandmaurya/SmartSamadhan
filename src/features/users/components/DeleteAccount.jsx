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
      const isAdmin = user.permissionLevel?.startsWith('admin');
      const ok = isAdmin ? await deleteAdmin(user.id) : await deleteUser(user.id);
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
      <div className="card" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>Delete Account</h2>
        <p style={{ fontSize: '12px', margin: 0 }}>Permanently delete your profile and complaints.</p>
        <div style={{
          marginTop: '8px',
          padding: '10px',
          border: '1px solid #f59e0b',
          background: 'rgba(245,158,11,0.08)',
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.4
        }}>
          <strong>Note:</strong> Your authentication identity (email credential) in Supabase Auth is <em>not</em> removed here because a service role key / server function is required. To fully erase auth credentials, contact support or implement a secured edge function.
        </div>

        <div style={{ marginTop: '14px', display: 'grid', gap: '8px', maxWidth: '420px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '12px' }}>Type DELETE to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            style={{
              padding: '8px 10px',
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
              padding: '8px 16px',
              backgroundColor: confirmText !== 'DELETE' || isDeleting ? 'var(--muted)' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: confirmText !== 'DELETE' || isDeleting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </button>

          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Type DELETE (uppercase). This cannot be undone.
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccount;
