import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for multi-namespace structure
import enCommon from './locales/en/common.json';
import enUser from './locales/en/user.json';
import enAdmin from './locales/en/admin.json';
import hiCommon from './locales/hi/common.json';
import hiUser from './locales/hi/user.json';
import hiAdmin from './locales/hi/admin.json';

const resources = {
  en: {
    common: enCommon,
    user: enUser,
    admin: enAdmin,
  },
  hi: {
    common: hiCommon,
    user: hiUser,
    admin: hiAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,

    // Default namespace
    defaultNS: 'common',
    ns: ['common', 'user', 'admin'],

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
