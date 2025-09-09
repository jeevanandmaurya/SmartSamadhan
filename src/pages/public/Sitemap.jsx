import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Sitemap() {
  const { t } = useTranslation();
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
    <div className="section section--narrow" style={{ color: 'var(--fg)', backgroundColor: 'var(--bg)' }}>
      <div className="card p-5">
        <div className="text-center mb-4">
          <h1 className="text-2xl mb-2 text-primary">{t('sitemapTitle')}</h1>
          <p className="text-xs text-muted">
            {t('sitemapSubtitle')}
          </p>
        </div>

        <div className="text-left text-fg text-sm" style={{ lineHeight: '1.4' }}>
          <h2 className="text-lg text-primary text-center mb-4">{t('systemFlowArchitecture')}</h2>

          {/* User Journey Section */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px' }}>👤 {t('userJourney')}</h3>
            <ol style={{ paddingLeft: '18px' }}>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('accessApp')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('openWebsite')}</li>
                  <li>{t('checkLoginStatus')}</li>
                </ul>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('authentication')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('ifNotLoggedIn')}</li>
                  <li>{t('ifLoggedIn')}</li>
                </ul>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('lodgeComplaint')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('fillForm')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('selectLocation')}</li>
                  <li>{t('uploadPhotos')}</li>
                </ul>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('submitProcess')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('saveToDatabase')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('generateRegistration')}</li>
                  <li>{t('sendNotification')}</li>
                </ul>
              </li>
              <li style={{ fontSize: '13px' }}>
                <strong>{t('trackStatus')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('viewHistory')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('seeUpdates')}</li>
                  <li>{t('addMoreDetails')}</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Admin Workflow Section */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px' }}>⚙️ {t('adminWorkflow')}</h3>
            <ol style={{ paddingLeft: '18px' }}>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('loginToAdmin')}</strong>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('viewDashboard')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('seeAllComplaints')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('filterByStatus')}</li>
                  <li>{t('sortByPriority')}</li>
                </ul>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('reviewComplaints')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('openDetails')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('viewAttachments')}</li>
                  <li>{t('checkUserInfo')}</li>
                </ul>
              </li>
              <li style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{t('takeAction')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '2px' }}>{t('updateStatus')}</li>
                  <li style={{ marginBottom: '2px' }}>{t('addNotes')}</li>
                  <li>{t('assignDepartment')}</li>
                </ul>
              </li>
              <li style={{ fontSize: '13px' }}>
                <strong>{t('realtimeUpdates')}</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                  <li>{t('changesPush')}</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Technical Architecture Section */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px' }}>🔧 {t('technicalArchitecture')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '14px' }}>{t('frontendReact')}</h4>
                <ul style={{ paddingLeft: '14px' }}>
                  <li style={{ marginBottom: '2px', fontSize: '12px' }}>{t('components')}</li>
                  <li style={{ marginBottom: '2px', fontSize: '12px' }}>{t('stateManagement')}</li>
                  <li style={{ fontSize: '12px' }}>{t('routing')}</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '14px' }}>{t('backendSupabase')}</h4>
                <ul style={{ paddingLeft: '14px' }}>
                  <li style={{ marginBottom: '2px', fontSize: '12px' }}>{t('authSystem')}</li>
                  <li style={{ marginBottom: '2px', fontSize: '12px' }}>{t('database')}</li>
                  <li style={{ marginBottom: '2px', fontSize: '12px' }}>{t('storage')}</li>
                  <li style={{ fontSize: '12px' }}>{t('realtime')}</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '14px' }}>{t('additionalTech')}</h4>
              <ul style={{ paddingLeft: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <li style={{ fontSize: '12px' }}>{t('maps')}</li>
                <li style={{ fontSize: '12px' }}>{t('hosting')}</li>
              </ul>
            </div>
          </section>

          {/* Data Flow Section */}
          <section>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px' }}>📊 {t('dataFlow')}</h3>
            <div style={{ backgroundColor: 'var(--card)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '12px', fontWeight: 'bold' }}>{t('inputAction')}</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '12px', fontWeight: 'bold' }}>{t('process')}</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--fg)', fontSize: '12px', fontWeight: 'bold' }}>{t('outputStorage')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('userInput')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('formValidation')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('databaseStorage')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('fileUpload')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('storageProcessing')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('metadata')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('statusChange')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('realtimeChannel')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('uiUpdate')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('location')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('geocoding')}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--fg)', fontSize: '11px' }}>{t('mapDisplay')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-4 text-xs text-muted" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          {t('simplifiedOverview')}
        </div>
      </div>
    </div>
  );
}

export default Sitemap;
