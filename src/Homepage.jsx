import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDatabase } from './DatabaseContext';

function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAdmins, setShowAdmins] = useState(false);
  const { getAllAdmins, getAdminsByLevel } = useDatabase();

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

  const admins = getAllAdmins();
  const stateAdmins = getAdminsByLevel('state');
  const cityAdmins = getAdminsByLevel('city');
  const sectorAdmins = getAdminsByLevel('sector');

  return (
    <div>
      {/* Main Content */}
      <div style={{ padding: '10px', textAlign: 'center', width: '100%' }}>
        {/* Image Slider */}
        <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden', marginBottom: '16px', borderRadius: '12px' }}>
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
          {/* Left Button */}
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(17,24,39,0.5)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            &#10094;
          </button>
          {/* Right Button */}
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(17,24,39,0.5)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            &#10095;
          </button>
        </div>

        {/* Purpose Description */}
  <div className="card" style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h2>About SmartSamadhan</h2>
          <p>
            SmartSamadhan is a platform designed to empower citizens to report civic issues like potholes, broken streetlights, and overflowing trash bins.
            Our goal is to bridge the gap between community members and local governments, ensuring prompt identification, prioritization, and resolution of everyday problems.
            With a mobile-first approach, real-time reporting, and an interactive dashboard, we aim to drive better civic engagement and government accountability.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/login">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>Login</button>
          </Link>
          <Link to="/view-status">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg)',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>View Status</button>
          </Link>
          <Link to="/contact-us">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg)',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>Contact Us</button>
          </Link>
        </div>

        {/* Admin Information Section */}
        <div className="card" style={{ marginTop: '30px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', color: 'var(--primary)' }}>Administrative Structure</h2>
            <button
              onClick={() => setShowAdmins(!showAdmins)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
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
                <h3 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>🏛️ State Level Administration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {stateAdmins.map(admin => (
                    <div key={admin.id} style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '5px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{admin.fullName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', margin: '5px 0' }}>{admin.role}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{admin.location}</div>
                      <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
                        Access Level: {admin.accessLevel} | Permissions: {admin.permissions.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* City Level Admin */}
              <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>🏙️ City Level Administration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {cityAdmins.map(admin => (
                    <div key={admin.id} style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '5px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{admin.fullName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', margin: '5px 0' }}>{admin.role}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{admin.location}</div>
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '5px' }}>
                        Access Level: {admin.accessLevel} | Permissions: {admin.permissions.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Level Admin */}
              <div style={{ padding: '15px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '2px solid #10b981' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#10b981' }}>🏘️ Sector/Block Level Administration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {sectorAdmins.map(admin => (
                    <div key={admin.id} style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '5px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{admin.fullName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', margin: '5px 0' }}>{admin.role}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{admin.location}</div>
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '5px' }}>
                        Access Level: {admin.accessLevel} | Permissions: {admin.permissions.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;
