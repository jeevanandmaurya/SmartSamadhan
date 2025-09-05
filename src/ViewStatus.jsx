import { useState } from 'react';

function ViewStatus() {
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock data for demonstration
    const mockReports = {
      '12345': { id: '12345', issue: 'Pothole on Main St', status: 'In Progress', department: 'Public Works' },
      '67890': { id: '67890', issue: 'Broken Streetlight', status: 'Resolved', department: 'Electricity' },
      '11111': { id: '11111', issue: 'Trash Bin Overflow', status: 'Pending', department: 'Sanitation' }
    };

    if (mockReports[registrationId]) {
      setStatus(mockReports[registrationId]);
    } else {
      setStatus({ error: 'Registration ID not found' });
    }
  };

  return (
    <div>
  <div style={{ padding: '10px', width: '100%' }}>
        <h2>View Report Status</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label>Registration ID:</label>
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              required
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px' }}>Check Status</button>
        </form>

        {status && (
          <div className="card" style={{ marginTop: '20px' }}>
            {status.error ? (
              <p style={{ color: 'red' }}>{status.error}</p>
            ) : (
              <div>
                <h3>Report Details</h3>
                <p><strong>ID:</strong> {status.id}</p>
                <p><strong>Issue:</strong> {status.issue}</p>
                <p><strong>Status:</strong> {status.status}</p>
                <p><strong>Department:</strong> {status.department}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewStatus;
