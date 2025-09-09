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
    { src: '/images/slide1.svg', text: t('slide1'), alt: t('slide1Alt') || 'Citizen Services' },
    { src: '/images/slide2.svg', text: t('slide2'), alt: t('slide2Alt') || 'Realtime Updates' },
    { src: '/images/slide3.svg', text: t('slide3'), alt: t('slide3Alt') || 'Secure & Reliable' },
  ];

  const [paused, setPaused] = useState(false);

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

  // Auto-slide (pauses on hover or when tab hidden)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  // Pause when tab hidden / resume when visible
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Preload images
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, []);

  return (
    <div className="section section--narrow homepage text-center gradient-page" style={{ paddingTop: 0 }}>
      {/* Hero / Slider (condensed) */}
      <div className="hero-slider neon-edge glow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(index - currentSlide) * 100}%`,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
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
            {/* Slide image */}
            <img
              src={slide.src}
              alt={slide.alt}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72)' }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Overlay removed to prevent outside visibility */}
            <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 12, maxWidth: 720 }}>
              <h1 className="gradient-text" style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>{slide.text}</h1>
              <p style={{ margin: '6px 0 0', opacity: .9, fontSize: 14 }}>Smart, citizen-first grievance redressal platform.</p>
            </div>
          </div>
        ))}
        <button onClick={prevSlide} className="btn btn--ghost glass-card lift" style={{ position: 'absolute', top: '50%', left: 6, transform: 'translateY(-50%)', color: '#fff', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label={t('previousSlide')}>&#10094;</button>
        <button onClick={nextSlide} className="btn btn--ghost glass-card lift" style={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', color: '#fff', border: 'none', padding: '4px 8px', fontSize: 16 }} aria-label={t('nextSlide')}>&#10095;</button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{ width: 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer', background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.6)' }}
            />
          ))}
        </div>
      </div>

      {/* About Section (condensed) */}
      <div className="card glass-card neon-edge lift" style={{ textAlign: 'left', marginTop: 16, marginBottom: 20, padding: '14px' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffeaa7)', borderRadius: 4, marginBottom: 10 }}>
                <p style={{ color: 'var(--warning-text, #856404)', margin: 0, fontWeight: 600, fontSize: 12, lineHeight: 1.4 }}>{t('emailWarning')}</p>
              </div>
              <h3 className="gradient-text" style={{ margin: '0 0 8px 0', fontSize: 16 }}>{t('aboutSmartSamadhan')}</h3>
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
        <Link to="/login" className="action-card gradient-blue lift" style={{ textDecoration: 'none', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-lock"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('login')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('accessAccount')}</p>
        </Link>
        <Link to="/view-status" className="action-card gradient-amber lift" style={{ textDecoration: 'none', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-chart-bar"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('status')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('trackReports')}</p>
        </Link>
        <Link to="/contact-us" className="action-card gradient-green lift" style={{ textDecoration: 'none', padding: '12px 10px' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }} className="fas fa-phone"></div>
          <h3 style={{ margin: '0 0 2px 0', fontSize: 16 }}>{t('contact')}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{t('getInTouch')}</p>
        </Link>
      </div>

      {/* Admin Information Section */}
  <div className="card glass-card neon-edge lift" style={{ marginTop: 24, textAlign: 'left', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <h2 className="gradient-text" style={{ margin: '0', fontSize: 18 }}>{t('userManagement')}</h2>
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
