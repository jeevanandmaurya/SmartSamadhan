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
    { src: '/images/slide4.svg', text: t('slide4'), alt: t('slide4Alt') || 'Community Support' },
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
      <div className="hero-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
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
        <Link to="/login#form" className="action-card gradient-blue lift" style={{ textDecoration: 'none', padding: '12px 10px' }}>
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

      {/* Android App Download Section */}
      <div className="card glass-card neon-edge lift" style={{ marginTop: 24, marginBottom: 20, padding: '14px' }}>
        <h3 className="gradient-text" style={{ margin: '0 0 16px 0', fontSize: 18, textAlign: 'center' }}>Download Our Android App</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Left Side: SVG and Info */}
          <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Phone SVG */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
              {/* Phone body */}
              <rect x="25" y="15" width="70" height="90" rx="8" ry="8" fill="url(#phoneGradient)" stroke="#e5e7eb" strokeWidth="2"/>
              {/* Screen */}
              <rect x="30" y="25" width="60" height="70" rx="4" ry="4" fill="#1f2937"/>
              {/* Home indicator */}
              <rect x="50" y="85" width="20" height="3" rx="1.5" ry="1.5" fill="#6b7280"/>
              {/* App icon */}
              <circle cx="60" cy="45" r="12" fill="#3b82f6"/>
              <rect x="54" y="39" width="12" height="12" rx="2" ry="2" fill="#3b82f6"/>
              {/* Stats elements */}
              <circle cx="45" cy="65" r="3" fill="#10b981"/>
              <circle cx="60" cy="65" r="3" fill="#f59e0b"/>
              <circle cx="75" cy="65" r="3" fill="#ef4444"/>
              {/* Download arrow */}
              <path d="M60 75 L55 80 L65 80 Z" fill="#ffffff"/>
              <line x1="60" y1="55" x2="60" y2="75" stroke="#ffffff" strokeWidth="2"/>
              {/* Gradient definition */}
              <defs>
                <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#f3f4f6', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#d1d5db', stopOpacity:1}} />
                </linearGradient>
              </defs>
            </svg>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>10K+</div>
                <div>Downloads</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>4.8★</div>
                <div>Rating</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>Free</div>
                <div>Download</div>
              </div>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.45, margin: '10px', textAlign: 'center' }}>
              SmartSamadhan is a mobile-first app designed exclusively for citizens.<br/>
              Get the Android app on your device for a seamless experience in reporting issues and tracking progress.
            </p>
          </div>

          {/* Right Side: Download Option */}
          <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--primary)' }}>Ready to Download?</h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px 0' }}>
                Download the APK file directly from our secure Google Drive link.
              </p>
            </div>

            <a
              href="https://drive.google.com/file/d/1A8eHqingjGHsCTQUG6ZZyUUtQq2gMf6Q/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary lift"
              style={{ padding: '14px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fab fa-android" style={{ fontSize: 18 }}></i>
              Download APK Now
            </a>

            <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
              <i className="fas fa-shield-alt" style={{ marginRight: '4px' }}></i>
              Secure & Virus-Free
            </div>
          </div>
        </div>
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
