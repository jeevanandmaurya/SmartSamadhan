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
          getAdminsByLevel('admin_level_1'),
          getAdminsByLevel('admin_level_2'),
          getAdminsByLevel('admin_level_3')
        ]);
        setAdmins(allAdmins);
        setStateAdmins(state);
        setCityAdmins(city);
        setSectorAdmins(sector);
      } catch (e) {
        console.error('Error loading admins', e);
      } finally {
        setLoadingAdmins(false);
      }
    };

    if (!loading) {
      loadAdmins();
    }
  }, [getAllAdmins, getAdminsByLevel, loading]);

  return (
    <div className="section section--narrow homepage" style={{ textAlign: 'center', paddingTop: 0 }}>
      {/* Hero / Slider (condensed) */}
      <div className="hero-slider" style={{ position: 'relative', height: 180, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
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
              color: '#fff',
              fontSize: 18,
              padding: '0 12px',
              lineHeight: 1.3,
              transition: 'left .5s ease'
            }}
          >
            {slide.text}
          </div>
        ))}
        <button onClick={prevSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', left: 6, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.45)', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label="Previous slide">&#10094;</button>
        <button onClick={nextSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.45)', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label="Next slide">&#10095;</button>
      </div>

      {/* About Section (condensed) */}
      <div className="card" style={{ textAlign: 'left', marginTop: 16, marginBottom: 20, padding: '14px' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffeaa7)', borderRadius: 4, marginBottom: 10 }}>
                <p style={{ color: 'var(--warning-text, #856404)', margin: 0, fontWeight: 600, fontSize: 12, lineHeight: 1.4 }}>Do not send grievances via email. Use this portal only.</p>
              </div>
              <h3 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontSize: 16 }}>About SmartSamadhan</h3>
              <p style={{ fontSize: 13, lineHeight: 1.45, margin: '0 0 6px 0' }}>
                24x7 unified civic grievance platform connecting citizens with government departments (central, state & local). Role-based access ensures secure processing.
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.45, margin: '0 0 10px 0' }}>
                Track issues via a unique registration ID. Escalation & appeal flow available if resolution is unsatisfactory.
              </p>
              <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 600, color: 'var(--primary)' }}>Excluded Issues:</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.4 }}>
                <li>RTI information requests</li>
                <li>Subjudice / court matters</li>
                <li>Religious disputes</li>
                <li>Govt service matters (unless internal channels exhausted)</li>
              </ul>
              <div style={{ marginTop: 10, padding: '8px 10px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, lineHeight: 1.35 }}>
                <strong>Note:</strong> No portal fee charged by government. Avoid unofficial intermediaries.
              </div>
  </div>

      {/* Primary Actions */}
      <div className="actions-grid homepage-actions" style={{ marginBottom: 16, gap: 10 }}>
        <Link to="/login" className="action-card" style={{ textDecoration: 'none', background: 'var(--primary)', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-lock"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>Login</h3>
          <p style={{ margin: 0, fontSize: 12 }}>Access your account</p>
        </Link>
        <Link to="/view-status" className="action-card alt" style={{ textDecoration: 'none', background: '#f59e0b', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-chart-bar"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>Status</h3>
          <p style={{ margin: 0, fontSize: 12 }}>Track reports</p>
        </Link>
        <Link to="/contact-us" className="action-card" style={{ textDecoration: 'none', background: '#10b981', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-phone"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>Contact</h3>
          <p style={{ margin: 0, fontSize: 12 }}>Get in touch</p>
        </Link>
      </div>

      {/* Admin Information Section */}
      <div className="card" style={{ marginTop: 24, textAlign: 'left', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: '0', color: 'var(--primary)', fontSize: 18 }}>Administrative Structure</h2>
            <button
              onClick={() => setShowAdmins(!showAdmins)}
            className="btn btn--primary"
            >
              {showAdmins ? 'Hide' : 'View'}
            </button>
          </div>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 }}>
            Hierarchical routing enables faster triage & accountability from state → city → sector.
          </p>

          {showAdmins && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* State Level Admin */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: 6, border: '2px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: 14 }}><i className="fas fa-landmark"></i> State Level</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {stateAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {admin.location}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* City Level Admin */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: 6, border: '2px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: 14 }}><i className="fas fa-city"></i> City Level</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {cityAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {admin.location}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sector Level Admin */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: 6, border: '2px solid #10b981' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: 14 }}><i className="fas fa-building"></i> Sector Level</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sectorAdmins.map(admin => (
                    <li key={admin.id} style={{
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{admin.fullName}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>({admin.role})</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
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
