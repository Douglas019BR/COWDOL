import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import pt from '../locales/pt/translation.json';

function resolvedLanguage(instance) {
  const candidate = instance.resolvedLanguage || instance.language || 'en';
  const base = candidate.split('-')[0];
  return instance.hasResourceBundle(base, 'translation') ? base : 'en';
}

function syncDocumentLanguage(instance) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = resolvedLanguage(instance);
  }
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

syncDocumentLanguage(i18n);
i18n.on('languageChanged', () => syncDocumentLanguage(i18n));

export default i18n;
