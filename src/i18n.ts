/* istanbul ignore file */
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    lng: sessionStorage.getItem('userLanguage') || DEFAULT_LANGUAGE,
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: `${process.env.BASE_URL || ''}/locales/{{lng}}/{{ns}}.json`
    }
  });

i18n.on('languageChanged', (lng) => {
  sessionStorage.setItem('userLanguage', lng);
});

export default i18n;