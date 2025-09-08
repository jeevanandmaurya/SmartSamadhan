import { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '../../contexts';

function UserManagement() {
  const { getAllUsers, getAllAdmins } = useDatabase();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allUsers, allAdmins] = await Promise.all([
          getAllUsers(),
          getAllAdmins()
        ]);
        setUsers(allUsers);
        setAdmins(allAdmins);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllUsers, getAllAdmins]);

  const allAccounts = useMemo(() => [...users, ...admins], [users, admins]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return allAccounts;
    return allAccounts.filter(account =>
      account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.username && account.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAccounts, searchTerm]);

  const totalComplaints = users.reduce((sum, user) => (user.complaints?.length || 0) + sum, 0);
  const activeUsers = users.filter(user => user.complaints?.length > 0).length;

  return (
    <div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2>User Management Dashboard</h2>
        <p>Monitor and manage all user accounts and their activities.</p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{users.length}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#10b981' }}>Active Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{activeUsers}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>Total Complaints</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{totalComplaints}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Avg Complaints/User</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
            {users.length > 0 ? (totalComplaints / users.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>User Directory</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg)',
              color: 'var(--fg)',
              width: '250px'
            }}
          />
        </div>

        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '15px' }}>
          Showing {filteredAccounts.length} of {allAccounts.length} accounts
        </div>

        {/* Users Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="card"
              style={{
                padding: '15px',
                cursor: 'pointer',
                border: selectedUser?.id === account.id ? '2px solid var(--primary)' : '1px solid var(--border)'
              }}
              onClick={() => setSelectedUser(selectedUser?.id === account.id ? null : account)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {account.fullName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px' }}>{account.fullName}</h4>
                  <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)' }}>@{account.username}</p>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                📧 {account.email}<br/>
                {account.phone && <>📱 {account.phone}<br/></>}
                {account.address && <>📍 {account.address}<br/></>}
                📅 Joined {new Date(account.createdAt).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {account.permissionLevel?.startsWith('admin') ? 'Admin' : `📋 ${account.complaints?.length || 0} complaints`}
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: account.permissionLevel?.startsWith('admin') ? '#8b5cf6' : (account.complaints?.length > 0 ? '#10b981' : '#6b7280'),
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {account.permissionLevel?.startsWith('admin') ? account.permissionLevel.replace('_', ' ').toUpperCase() : (account.complaints?.length > 0 ? 'Active' : 'Inactive')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAccounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            No accounts found matching your search.
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>User Details: {selectedUser.fullName}</h3>
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* User Information */}
            <div>
              <h4 style={{ marginBottom: '15px' }}>Personal Information</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>FULL NAME</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedUser.fullName}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>USERNAME</div>
                  <div>{selectedUser.username}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>EMAIL</div>
                  <div>{selectedUser.email}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>PHONE</div>
                  <div>{selectedUser.phone}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>ADDRESS</div>
                  <div>{selectedUser.address}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>MEMBER SINCE</div>
                  <div>{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Complaint History */}
            <div>
              <h4 style={{ marginBottom: '15px' }}>Complaint History ({selectedUser.complaints?.length || 0})</h4>
              
              {selectedUser.permissionLevel?.startsWith('admin') ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                  Admins do not submit complaints.
                </div>
              ) : (
                (!selectedUser.complaints || selectedUser.complaints.length === 0) ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                    No complaints submitted yet
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                    {selectedUser.complaints.map((complaint) => (
                      <div key={complaint.id} style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <h5 style={{ margin: '0', fontSize: '14px' }}>{complaint.title || complaint.issue}</h5>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            backgroundColor: complaint.status === 'Resolved' ? '#10b981' :
                                           complaint.status === 'In Progress' ? '#f59e0b' : '#ef4444',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {complaint.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                          📋 {complaint.regNumber} | 🏢 {complaint.department}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          📅 {new Date(complaint.dateSubmitted).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
