import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  return (
    <div className="section section--narrow">
      <div className="card p-6">
        <h1 className="text-2xl mb-4">{t('aboutTitle')}</h1>

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

        <div className="card p-4 mb-4">
          <strong>{t('aboutContactName')}</strong><br />
          {t('aboutContactTitle')}<br />
          {t('aboutContactDept')}<br />
          {t('aboutContactAddress')}<br />
          <strong>{t('aboutContactPhone')}</strong> {t('aboutContactPhoneNumber')}
        </div>

        <div className="divider" />
        <p className="text-center mb-0">
          <Link to="/" className="text-primary font-bold">{t('backToHome')}</Link>
        </p>
      </div>
    </div>
  );
}

export default About;
