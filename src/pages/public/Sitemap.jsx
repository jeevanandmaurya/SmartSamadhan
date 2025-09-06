import { Link } from 'react-router-dom';

function Sitemap() {
  return (
    <div className="section section--narrow">
      <div className="card" style={{ padding: '24px' }}>
        <h1 style={{ marginTop: 0 }}>Sitemap</h1>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/">Home</Link> - Main landing page with slider and information
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/about">About</Link> - Information about SmartSamadhan
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/login">Login</Link> - Login page for users and admins
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/view-status">View Status</Link> - Check status of reports by registration ID
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/contact-us">Contact Us</Link> - Contact information and grievances officers
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/user-dashboard">User Dashboard</Link> - Dashboard for logged-in users
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/admin-dashboard">Admin Dashboard</Link> - Dashboard for administrators
          </li>
  </ul>
      </div>
    </div>
  );
}

export default Sitemap;
