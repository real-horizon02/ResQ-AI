import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation resources from public folder
import enTranslation from '../../public/locales/en/translation.json'
import hiTranslation from '../../public/locales/hi/translation.json'
import hinglishTranslation from '../../public/locales/hinglish/translation.json'

const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  hinglish: {
    translation: hinglishTranslation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // Enable debug to see translation issues
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
