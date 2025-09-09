import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  return (
    <div className="section section--narrow">
      <div className="card" style={{ padding: '24px' }}>
        <h1>{t('aboutTitle')}</h1>

        <p>
          <strong>{t('aboutDirector')}</strong> {t('aboutDirectorDesc')}
        </p>

        <p>
          {t('aboutDarpgDesc')}
        </p>

        <p>
          {t('aboutPortalDesc')}
        </p>

        <p>
          {t('aboutAiDesc')} (<a href={t('aboutIgmsLink')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{t('aboutIgmsLink')}</a>) {t('aboutIgmsDesc')} <a href={t('aboutTreeLink')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{t('aboutTreeLink')}</a>
        </p>

        <p>
          {t('aboutIgmsFunctions')}
        </p>

        <ul>
          <li>{t('aboutIgmsFunction1')}</li>
          <li>{t('aboutIgmsFunction2')}</li>
          <li>{t('aboutIgmsFunction3')}</li>
          <li>{t('aboutIgmsFunction4')}</li>
        </ul>

        <p>
          {t('aboutContactDesc')}
        </p>

        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '5px' }}>
          <strong>{t('aboutContactName')}</strong><br />
          {t('aboutContactTitle')}<br />
          {t('aboutContactDept')}<br />
          {t('aboutContactAddress')}<br />
          <strong>{t('aboutContactPhone')}</strong> {t('aboutContactPhoneNumber')}
        </div>

        <div className="divider" />
        <p style={{ textAlign: 'center', margin: 0 }}>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>{t('backToHome')}</Link>
        </p>
      </div>
    </div>
  );
}

export default About;
