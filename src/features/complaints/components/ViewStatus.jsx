import { useState, useEffect } from 'react';
import { useDatabase } from '../../../contexts';

function ViewStatus() {
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);

  const { getComplaintByRegNumber, getAllComplaints } = useDatabase();

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const allComplaints = await getAllComplaints();
        setComplaints(allComplaints);
      } catch (error) {
        console.error('Error loading complaints:', error);
      }
    };

    loadComplaints();
  }, [getAllComplaints]);

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

    try {
      const upperRegId = registrationId.toUpperCase();
      const complaint = await getComplaintByRegNumber(upperRegId);
      if (complaint) {
        setStatus(complaint);
      } else {
        setStatus({ error: 'Registration ID not found. Please check and try again.' });
      }
    } catch (e) {
      console.error('Status lookup failed', e);
      setStatus({ error: 'Lookup failed. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRegistrationId('');
    setStatus(null);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="card" style={{ padding: '14px', marginBottom: '14px' }}>
        <h2 style={{ margin: '0 0 4px 0', color: 'var(--primary)', fontSize: '18px' }}>Check Status</h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px', lineHeight: 1.4 }}>Enter your registration number to view current status.</p>
      </div>

      {/* Search Form */}
      <div className="card" style={{ padding: '14px', marginBottom: '14px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: 'var(--fg)',
              fontSize: '12px'
            }}>
              Reg #
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
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            />
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--muted)' }}>
              Use your complaint reference (e.g., REG001)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              {isLoading ? 'Checking...' : 'Check Status'}
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
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--primary)' }}>🔍 Searching...</div>
          <div style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '12px' }}>Fetching details.</div>
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
            <div className="card" style={{ padding: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <h3 style={{ margin: '0', color: 'var(--primary)', fontSize: '16px' }}>Report Details</h3>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(status.status),
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {status.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>REGISTRATION NUMBER</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.regNumber}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>REPORT ID</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.id}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>DEPARTMENT</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.department}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>PRIORITY</div>
                    <span
                      style={{
                        padding: '3px 6px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(status.priority),
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      {status.priority}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>ISSUE CATEGORY</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3' }}>
                    {status.category || `${status.mainCategory || 'N/A'} > ${status.subCategory1 || 'N/A'} > ${status.specificIssue || 'N/A'}`}
                  </div>
                </div>

                {/* Location Information */}
                {status.location && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>LOCATION</div>
                    <div style={{ fontSize: '13px' }}>{status.location}</div>
                    {status.latitude && status.longitude && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        {status.latitude.toFixed(6)}, {status.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Information */}
                {status.attachments && status.attachments > 0 && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>ATTACHMENTS</div>
                    <div style={{ fontSize: '13px' }}>{status.attachments} file(s) attached</div>
                  </div>
                )}

                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>DESCRIPTION</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{status.description || status.title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>DATE SUBMITTED</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{new Date(status.dateSubmitted || status.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>LAST UPDATED</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{new Date(status.lastUpdated).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>ASSIGNED TO</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.assignedTo}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '13px' }}>Timeline</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>Submitted</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'In Progress' || status.status === 'Resolved' ? '#f59e0b' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>In Progress</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'Resolved' ? '#10b981' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Registration Numbers */}
      <div className="card" style={{ padding: '14px', marginTop: '14px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '14px' }}>Sample Reg #</h4>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {complaints.slice(0, 5).map(complaint => (
            <button
              key={complaint.regNumber}
              onClick={() => setRegistrationId(complaint.regNumber)}
              style={{
                padding: '6px 10px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {complaint.regNumber}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--muted)' }}>
          Click to auto-fill.
        </div>
      </div>
    </div>
  );
}

export default ViewStatus;
