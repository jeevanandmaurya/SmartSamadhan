import { useState, useEffect } from 'react';

function Sitemap() {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply the theme to the document on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
    };

    // Check for theme changes periodically
    const interval = setInterval(handleThemeChange, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="section" style={{ color: 'var(--fg)', fontFamily: 'system-ui', width: '100%', maxWidth: 'none', padding: '20px 12px', backgroundColor: 'var(--bg)' }}>
      <div className="card" style={{ padding: '20px', backgroundColor: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, margin: '0 0 8px 0', color: 'var(--primary)' }}>SmartSamadhan - Simple Flow</h1>
            <p style={{ fontSize: 12, margin: 0, color: 'var(--muted)', maxWidth: 'none' }}>
              Minimal view of how a complaint moves through the system. Left to right: user submits, data stored, admin updates, user sees status.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'left', width: '100%', margin: '0 auto', fontSize: '14px', lineHeight: '1.5', color: 'var(--fg)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px', textAlign: 'center', fontSize: '20px' }}>System Flow Architecture</h2>

          {/* User Journey Section */}
          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', borderBottom: '2px solid var(--primary)', paddingBottom: '6px', fontSize: '18px' }}>👤 User Journey</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Access App</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Open Website/Mobile App</li>
                  <li>Check Login Status</li>
                </ul>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Authentication</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>If not logged in → Login/Signup</li>
                  <li>If logged in → Go to Dashboard</li>
                </ul>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Lodge Complaint</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Fill Form (Title, Description, Category)</li>
                  <li style={{ marginBottom: '4px' }}>Select Location on Interactive Map</li>
                  <li>Optional: Upload Photos/Documents</li>
                </ul>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Submit & Process</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Save to Supabase Database</li>
                  <li style={{ marginBottom: '4px' }}>Generate Registration Number</li>
                  <li>Send Realtime Notification</li>
                </ul>
              </li>
              <li style={{ fontSize: '14px' }}>
                <strong>Track Status</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>View Complaint History</li>
                  <li style={{ marginBottom: '4px' }}>See Real-time Updates</li>
                  <li>Add More Details if Needed</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Admin Workflow Section */}
          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', borderBottom: '2px solid var(--primary)', paddingBottom: '6px', fontSize: '18px' }}>⚙️ Admin Workflow</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Login to Admin Panel</strong>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>View Dashboard</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>See All Complaints</li>
                  <li style={{ marginBottom: '4px' }}>Filter by Status/Category</li>
                  <li>Sort by Priority/Date</li>
                </ul>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Review Complaints</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Open Complaint Details</li>
                  <li style={{ marginBottom: '4px' }}>View Attachments & Location</li>
                  <li>Check User Information</li>
                </ul>
              </li>
              <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>Take Action</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Update Status (Pending → In Progress → Resolved)</li>
                  <li style={{ marginBottom: '4px' }}>Add Notes/Comments</li>
                  <li>Assign to Department (if needed)</li>
                </ul>
              </li>
              <li style={{ fontSize: '14px' }}>
                <strong>Real-time Updates</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                  <li>Changes Push Instantly to User</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Technical Architecture Section */}
          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', borderBottom: '2px solid var(--primary)', paddingBottom: '6px', fontSize: '18px' }}>🔧 Technical Architecture</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--fg)', marginBottom: '10px', fontSize: '16px' }}>Frontend (React)</h4>
                <ul style={{ paddingLeft: '16px' }}>
                  <li style={{ marginBottom: '4px', fontSize: '12px' }}>Components: Forms, Maps, Tables</li>
                  <li style={{ marginBottom: '4px', fontSize: '12px' }}>State Management: Context API</li>
                  <li style={{ fontSize: '12px' }}>Routing: React Router</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--fg)', marginBottom: '10px', fontSize: '16px' }}>Backend (Supabase)</h4>
                <ul style={{ paddingLeft: '16px' }}>
                  <li style={{ marginBottom: '4px', fontSize: '12px' }}>Authentication: User/Admin Login</li>
                  <li style={{ marginBottom: '4px', fontSize: '12px' }}>Database: PostgreSQL Tables</li>
                  <li style={{ marginBottom: '4px', fontSize: '12px' }}>Storage: File Uploads</li>
                  <li style={{ fontSize: '12px' }}>Realtime: Live Updates</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ color: 'var(--fg)', marginBottom: '10px', fontSize: '16px' }}>Additional Technologies</h4>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <li style={{ fontSize: '12px' }}>Maps: Leaflet + OpenStreetMap</li>
                <li style={{ fontSize: '12px' }}>Hosting: Vercel/Netlify</li>
              </ul>
            </div>
          </section>

          {/* Data Flow Section */}
          <section>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', borderBottom: '2px solid var(--primary)', paddingBottom: '6px', fontSize: '18px' }}>📊 Data Flow</h3>
            <div style={{ backgroundColor: 'var(--card)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '14px', fontWeight: 'bold' }}>Input/Action</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '14px', fontWeight: 'bold' }}>Process</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '14px', fontWeight: 'bold' }}>Output/Storage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>User Input</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Form Validation</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Database</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>File Upload</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Storage Processing</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Metadata in DB</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Status Change</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Realtime Channel</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>UI Update</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Location</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Geocoding</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '12px' }}>Map Display</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          This is a simplified overview. For full details, check the code or docs.
        </div>
      </div>
    </div>
  );
}

export default Sitemap;
