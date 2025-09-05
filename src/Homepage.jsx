import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

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

          {/* Decorative CSS Objects */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '60%',
            left: '15%',
            width: '0',
            height: '0',
            borderLeft: '30px solid transparent',
            borderRight: '30px solid transparent',
            borderBottom: '52px solid rgba(255,255,255,0.3)',
            animation: 'float 4s ease-in-out infinite reverse'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            width: '45px',
            height: '45px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            transform: 'rotate(45deg)',
            animation: 'float 2.5s ease-in-out infinite'
          }}></div>

          <div style={{
            position: 'absolute',
            bottom: '25%',
            right: '10%',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            animation: 'float 3.5s ease-in-out infinite reverse'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '50%',
            left: '70%',
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            animation: 'float 2s ease-in-out infinite'
          }}></div>

          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '60%',
            width: '35px',
            height: '35px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '50%',
            animation: 'float 4.5s ease-in-out infinite reverse'
          }}></div>

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
              fontSize: '18px',
              zIndex: 10
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
              fontSize: '18px',
              zIndex: 10
            }}
          >
            &#10095;
          </button>
        </div>



        {/* CPGRAMS Information */}
        <div className="card" style={{ marginBottom: '20px', textAlign: 'left' }}>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffeaa7)', borderRadius: '5px' }}>
            <p style={{ color: 'var(--warning-text, #856404)', margin: 0, fontWeight: 'bold' }}>
              Any Grievance sent by email will not be attended to / entertained. Please lodge your grievance on this portal.
            </p>
          </div>

          <h3 style={{ color: 'var(--primary)', marginTop: '20px' }}>ABOUT SMARTSAMADHAN</h3>
          <p>
            SmartSamadhan is an online platform available to the citizens 24x7 to lodge their grievances to the public authorities on any subject related to service delivery. It is a single portal connected to all the Ministries/Departments of Government of India and States. Every Ministry and States have role-based access to this system. SmartSamadhan is also accessible to the citizens through standalone mobile application downloadable through Google Play store and mobile application integrated with UMANG.
          </p>

          <p>
            The status of the grievance filed in SmartSamadhan can be tracked with the unique registration ID provided at the time of registration of the complainant. SmartSamadhan also provides appeal facility to the citizens if they are not satisfied with the resolution by the Grievance Officer. After closure of grievance if the complainant is not satisfied with the resolution, he/she can provide feedback. If the rating is 'Poor' the option to file an appeal is enabled. The status of the Appeal can also be tracked by the petitioner with the grievance registration number.
          </p>

          <h4 style={{ color: 'var(--primary)' }}>Issues which are not taken up for redress:</h4>
          <ul>
            <li>RTI Matters</li>
            <li>Court related / Subjudice matters</li>
            <li>Religious matters</li>
            <li>Grievances of Government employees concerning their service matters including disciplinary proceedings etc. unless the aggrieved employee has already exhausted the prescribed channels keeping in view the DoPT OM No. 11013/08/2013-Estt.(A-III) dated 31.08.2015</li>
          </ul>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '5px' }}>
            <strong>Note:</strong> If you have not got a satisfactory redress of your grievance within a reasonable period of time, relating to Ministries/Departments and Organisations under the purview of Directorate of Public Grievances(DPG), Cabinet Secretariat, GOI, you may seek help of DPG in resolution. Please click here for details.
          </div>

          <p style={{ marginTop: '15px' }}>
            Government is not charging fee from the public for filing grievances. All money being paid by the public for filing grievance is going only to M/s CSC only
          </p>
        </div>

        {/* Action Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '30px',
              textAlign: 'center',
              border: '2px solid var(--primary)',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Login</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Access your account</p>
            </div>
          </Link>

          <Link to="/view-status" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              backgroundColor: '#f59e0b',
              color: '#fff',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>View Status</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Check your reports</p>
            </div>
          </Link>

          <Link to="/contact-us" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #10b981',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              color: '#fff',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📞</div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Contact Us</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Get in touch</p>
            </div>
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
                <h3 style={{ margin: '0 0 15px 0', color: '#ef4444' }}>🏛️ State Level Administration</h3>
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
                <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b' }}>🏙️ City Level Administration</h3>
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
                <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>🏘️ Sector/Block Level Administration</h3>
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
    </div>
  );
}

export default Homepage;
