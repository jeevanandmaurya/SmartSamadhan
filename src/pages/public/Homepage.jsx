import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatabase } from '../../contexts';

function Homepage() {
  const { t } = useTranslation('common');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAdmins, setShowAdmins] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [stateAdmins, setStateAdmins] = useState([]);
  const [cityAdmins, setCityAdmins] = useState([]);
  const [sectorAdmins, setSectorAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const { getAllAdmins, getAdminsByLevel, loading } = useDatabase();

  const slides = [
    { color: 'red', text: t('slide1') },
    { color: 'green', text: t('slide2') },
    { color: 'blue', text: t('slide3') }
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
        <button onClick={prevSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', left: 6, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.45)', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label={t('previousSlide')}>&#10094;</button>
        <button onClick={nextSlide} className="btn btn--ghost" style={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', color: '#fff', background: 'rgba(17,24,39,0.45)', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label={t('nextSlide')}>&#10095;</button>
      </div>

      {/* About Section (condensed) */}
      <div className="card" style={{ textAlign: 'left', marginTop: 16, marginBottom: 20, padding: '14px' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffeaa7)', borderRadius: 4, marginBottom: 10 }}>
                <p style={{ color: 'var(--warning-text, #856404)', margin: 0, fontWeight: 600, fontSize: 12, lineHeight: 1.4 }}>{t('emailWarning')}</p>
              </div>
              <h3 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontSize: 16 }}>{t('aboutSmartSamadhan')}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.45, margin: '0 0 6px 0' }}>
                {t('platformDescription')}
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.45, margin: '0 0 10px 0' }}>
                {t('trackingDescription')}
              </p>
              <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 600, color: 'var(--primary)' }}>{t('excludedIssues')}</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.4 }}>
                <li>{t('excludedIssue1')}</li>
                <li>{t('excludedIssue2')}</li>
                <li>{t('excludedIssue3')}</li>
                <li>{t('excludedIssue4')}</li>
              </ul>
              <div style={{ marginTop: 10, padding: '8px 10px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, lineHeight: 1.35 }}>
                <strong>{t('note')}</strong> {t('noteText')}
              </div>
  </div>

      {/* Primary Actions */}
      <div className="actions-grid homepage-actions" style={{ marginBottom: 16, gap: 10 }}>
        <Link to="/login" className="action-card" style={{ textDecoration: 'none', background: 'var(--primary)', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-lock"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('login')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('accessAccount')}</p>
        </Link>
        <Link to="/view-status" className="action-card alt" style={{ textDecoration: 'none', background: '#f59e0b', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-chart-bar"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('status')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('trackReports')}</p>
        </Link>
        <Link to="/contact-us" className="action-card" style={{ textDecoration: 'none', background: '#10b981', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-phone"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('contact')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('getInTouch')}</p>
        </Link>
      </div>

      {/* Admin Information Section */}
      <div className="card" style={{ marginTop: 24, textAlign: 'left', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: '0', color: 'var(--primary)', fontSize: 18 }}>{t('userManagement')}</h2>
            <button
              onClick={() => setShowAdmins(!showAdmins)}
            className="btn btn--primary"
            >
              {showAdmins ? t('cancel') : t('view')}
            </button>
          </div>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 }}>
            {t('hierarchicalDescription')}
          </p>

          {showAdmins && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* State Level Admin */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: 6, border: '2px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: 14 }}><i className="fas fa-landmark"></i> {t('stateLevel')}</h3>
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
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: 14 }}><i className="fas fa-city"></i> {t('cityLevel')}</h3>
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
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: 14 }}><i className="fas fa-building"></i> {t('sectorLevel')}</h3>
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
