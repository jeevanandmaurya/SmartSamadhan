import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts';

function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAdmins, setShowAdmins] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [stateAdmins, setStateAdmins] = useState([]);
  const [cityAdmins, setCityAdmins] = useState([]);
  const [sectorAdmins, setSectorAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const { getAllAdmins, getAdminsByLevel, loading } = useDatabase();

  const slides = [
    { color: 'red', text: 'Report Civic Issues Easily' },
    { color: 'green', text: 'Track Your Reports in Real-Time' },
    { color: 'blue', text: 'Help Improve Your Community' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const loadAdmins = async () => {
      if (loading) return; // Don't load if database is still initializing

      try {
        const [allAdmins, state, city, sector] = await Promise.all([
          getAllAdmins(),
          getAdminsByLevel('state'),
          getAdminsByLevel('city'),
          getAdminsByLevel('sector')
        ]);
        setAdmins(allAdmins);
        setStateAdmins(state);
        setCityAdmins(city);
        setSectorAdmins(sector);
      } catch (error) {
        console.error('Error loading admins:', error);
      } finally {
        setLoadingAdmins(false);
      }
    };

    if (!loading) {
      loadAdmins();
    }
  }, [getAllAdmins, getAdminsByLevel, loading]);

  return (
    <div className="section section--narrow homepage" style={{ textAlign: 'center' }}>
      {/* Hero / Slider */}
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(index - currentSlide) * 100}%`,
              width: '100%',
              height: '100%',
              backgroundColor: slide.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              transition: 'left 0.5s ease-in-out'
            }}
          >
            {slide.text}
          </div>
        ))}
        <button onClick={prevSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.35)', border: 'none' }} aria-label="Previous slide">&#10094;</button>
        <button onClick={nextSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.35)', border: 'none' }} aria-label="Next slide">&#10095;</button>
      </div>

      {/* About Section */}
  <div className="card" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <div style={{ marginTop: '12px', padding: '15px', backgroundColor: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffeaa7)', borderRadius: '5px' }}>
          <p style={{ color: 'var(--warning-text, #856404)', margin: 0, fontWeight: 'bold', fontSize: 14 }}>
            Any Grievance sent by email will not be attended to / entertained. Please lodge your grievance on this portal.
          </p>
        </div>
        <h3 style={{ color: 'var(--primary)', marginTop: '20px' }}>ABOUT SMARTSAMADHAN</h3>
        <p>
          SmartSamadhan is an online platform available to the citizens 24x7 to lodge their grievances to the public authorities on any subject related to service delivery. It is a single portal connected to all the Ministries/Departments of Government of India and States. Every Ministry and States have role-based access to this system.
        </p>
        <p>
          The status of the grievance filed in SmartSamadhan can be tracked with the unique registration ID provided at the time of registration of the complainant. The platform also provides appeal facility if not satisfied with a resolution.
        </p>
        <h4 style={{ color: 'var(--primary)' }}>Issues not taken up:</h4>
        <ul>
          <li>RTI Matters</li>
          <li>Court related / Subjudice matters</li>
          <li>Religious matters</li>
          <li>Government employee service matters without exhausting internal channels</li>
        </ul>
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '5px', fontSize: 14 }}>
          <strong>Note:</strong> For persistent unresolved issues under DPG purview you may seek assistance via official channels.
        </div>
        <p style={{ marginTop: '15px', fontSize: 14 }}>
          Government doesn't charge a fee for grievances. Any payment users make goes only to service facilitation partners.
        </p>
      </div>

      {/* Primary Actions */}
  <div className="actions-grid homepage-actions">
        <Link to="/login" className="action-card" style={{ textDecoration: 'none', background: 'var(--primary)' }}>
          <div style={{ fontSize: 42 }} className="fas fa-lock"></div>
          <h3>Login</h3>
          <p>Access your account</p>
        </Link>
        <Link to="/view-status" className="action-card alt" style={{ textDecoration: 'none', background: '#f59e0b' }}>
          <div style={{ fontSize: 42 }} className="fas fa-chart-bar"></div>
          <h3>View Status</h3>
          <p>Check your reports</p>
        </Link>
        <Link to="/contact-us" className="action-card" style={{ textDecoration: 'none', background: '#10b981' }}>
          <div style={{ fontSize: 42 }} className="fas fa-phone"></div>
          <h3>Contact Us</h3>
          <p>Get in touch</p>
        </Link>
      </div>

      {/* Admin Information Section */}
  <div className="card" style={{ marginTop: '40px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', color: 'var(--primary)' }}>Administrative Structure</h2>
            <button
              onClick={() => setShowAdmins(!showAdmins)}
            className="btn btn--primary"
            >
              {showAdmins ? 'Hide Admins' : 'View Admins'}
            </button>
          </div>

          <p style={{ marginBottom: '20px', color: 'var(--muted)' }}>
            Our administrative structure is organized hierarchically to ensure efficient governance and quick resolution of civic issues.
          </p>

          {showAdmins && (
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* State Level Admin */}
              <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '2px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#ef4444' }}><i className="fas fa-landmark"></i> State Level Administration</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {stateAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: '10px' }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {admin.location}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* City Level Admin */}
              <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b' }}><i className="fas fa-city"></i> City Level Administration</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {cityAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: '10px' }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {admin.location}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sector Level Admin */}
              <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '2px solid #10b981' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}><i className="fas fa-building"></i> Sector/Block Level Administration</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sectorAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: '10px' }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {admin.location}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default Homepage;
