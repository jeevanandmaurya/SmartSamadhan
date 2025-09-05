import { useState } from 'react';
import { useDatabase } from './DatabaseContext';

function ViewStatus() {
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getComplaintByRegNumber, complaints } = useDatabase();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    // Simulate API call delay
    setTimeout(() => {
      const upperRegId = registrationId.toUpperCase();
      const complaint = getComplaintByRegNumber(upperRegId);
      if (complaint) {
        setStatus(complaint);
      } else {
        setStatus({ error: 'Registration ID not found. Please check and try again.' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setRegistrationId('');
    setStatus(null);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>View Report Status</h2>
        <p style={{ margin: '0', color: 'var(--muted)' }}>
          Enter your registration number to check the current status of your complaint.
        </p>
      </div>

      {/* Search Form */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'var(--fg)'
            }}>
              Registration Number:
            </label>
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder="e.g., REG001"
              required
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '16px'
              }}
            />
            <div style={{ marginTop: '5px', fontSize: '12px', color: 'var(--muted)' }}>
              Enter the registration number from your complaint (e.g., REG001, REG002)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              {isLoading ? 'Checking...' : 'Check Status'}
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
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'var(--primary)' }}>🔍 Searching for your report...</div>
          <div style={{ marginTop: '10px', color: 'var(--muted)' }}>Please wait while we fetch the details.</div>
        </div>
      )}

      {/* Status Result */}
      {status && !isLoading && (
        <div>
          {status.error ? (
            <div className="card" style={{
              padding: '20px',
              border: '1px solid #ef4444',
              backgroundColor: '#fef2f2'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>❌</div>
                <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Report Not Found</h3>
                <p style={{ color: '#ef4444', margin: '0' }}>{status.error}</p>
                <div style={{ marginTop: '15px', fontSize: '14px', color: 'var(--muted)' }}>
                  Make sure you're entering the correct registration number from your complaint.
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <h3 style={{ margin: '0', color: 'var(--primary)' }}>Report Details</h3>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(status.status),
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {status.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>REGISTRATION NUMBER</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{status.regNumber}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>REPORT ID</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{status.id}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>DEPARTMENT</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{status.department}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>PRIORITY</div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(status.priority),
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {status.priority}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>COMPLAINT DESCRIPTION</div>
                  <div style={{ fontSize: '16px', lineHeight: '1.5' }}>{status.description || status.title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>DATE SUBMITTED</div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{new Date(status.dateSubmitted || status.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>LAST UPDATED</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{new Date(status.lastUpdated).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>ASSIGNED TO</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{status.assignedTo}</div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Status Timeline</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>Submitted</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'In Progress' || status.status === 'Resolved' ? '#f59e0b' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>In Progress</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'Resolved' ? '#10b981' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Registration Numbers */}
      <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Sample Registration Numbers</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {complaints.slice(0, 5).map(complaint => (
            <button
              key={complaint.regNumber}
              onClick={() => setRegistrationId(complaint.regNumber)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {complaint.regNumber}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>
          Click any registration number above to quickly test the status checker.
        </div>
      </div>
    </div>
  );
}

export default ViewStatus;
