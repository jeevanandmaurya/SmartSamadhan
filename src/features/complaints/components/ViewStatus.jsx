import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatabase } from '../../../contexts';

function ViewStatus() {
  const { t } = useTranslation();
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [imagePreview, setImagePreview] = useState({ show: false, src: '', name: '' });

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
        <h2 style={{ margin: '0 0 4px 0', color: 'var(--primary)', fontSize: '18px' }}>{t('user:checkStatus')}</h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px', lineHeight: 1.4 }}>{t('user:enterRegistrationNumber')}</p>
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
              {t('user:registrationNumber')}
            </label>
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder={t('user:registrationExample')}
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
              {t('user:useComplaintReference')}
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
              {isLoading ? t('user:checking') : t('user:checkStatus')}
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
              {t('user:clear')}
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--primary)' }}>🔍 {t('user:searching')}</div>
          <div style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '12px' }}>{t('user:fetchingDetails')}</div>
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
                <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>{t('user:reportNotFound')}</h3>
                <p style={{ color: '#ef4444', margin: '0' }}>{status.error}</p>
                <div style={{ marginTop: '15px', fontSize: '14px', color: 'var(--muted)' }}>
                  {t('user:ensureCorrectRegistration')}
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
                <h3 style={{ margin: '0', color: 'var(--primary)', fontSize: '16px' }}>{t('user:reportDetails')}</h3>
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
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:registrationNumber')}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.regNumber}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:reportId')}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.id}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:department')}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.department}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:priority')}</div>
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
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:issueCategory')}</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3' }}>
                    {status.category || `${status.mainCategory || 'N/A'} > ${status.subCategory1 || 'N/A'} > ${status.specificIssue || 'N/A'}`}
                  </div>
                </div>

                {/* Location Information */}
                {status.location && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:location')}</div>
                    <div style={{ fontSize: '13px' }}>{status.location}</div>
                    {status.latitude && status.longitude && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        {status.latitude.toFixed(6)}, {status.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Information */}
                {status.attachments && status.attachments.length > 0 && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{t('user:attachments')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {status.attachments.map((attachment, index) => {
                        const isImage = attachment.type && attachment.type.startsWith('image/');
                        return (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            {isImage ? (
                              <div
                                onClick={() => setImagePreview({ show: true, src: attachment.url, name: attachment.name })}
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'var(--card-bg)',
                                  flexShrink: 0
                                }}
                              >
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '3px',
                                    display: 'block'
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--card-bg)',
                                flexShrink: 0
                              }}>
                                <i className="fas fa-file" style={{ fontSize: '16px', color: 'var(--muted)' }}></i>
                              </div>
                            )}
                            <div style={{
                              fontSize: '10px',
                              color: 'var(--muted)',
                              textAlign: 'center',
                              maxWidth: '44px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {attachment.name.split('.').slice(0, -1).join('.')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{t('user:description')}</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{status.description || status.title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:dateSubmitted')}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{new Date(status.dateSubmitted || status.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:lastUpdated')}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{new Date(status.lastUpdated).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{t('user:assignedTo')}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{status.assignedTo}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '13px' }}>{t('user:timeline')}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>{t('user:submitted')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'In Progress' || status.status === 'Resolved' ? '#f59e0b' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>{t('user:inProgress')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.status === 'Resolved' ? '#10b981' : '#e5e7eb'
                    }}></div>
                    <span style={{ fontSize: '12px' }}>{t('user:resolved')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Registration Numbers */}
      <div className="card" style={{ padding: '14px', marginTop: '14px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '14px' }}>{t('user:sampleRegNumbers')}</h4>
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
          {t('user:clickToAutoFill')}
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setImagePreview({ show: false, src: '', name: '' })}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '400px',
              maxHeight: '400px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setImagePreview({ show: false, src: '', name: '' })}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                zIndex: 1,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Image */}
            <img
              src={imagePreview.src}
              alt={imagePreview.name}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'auto'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewStatus;
