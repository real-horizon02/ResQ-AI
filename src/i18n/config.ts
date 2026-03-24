import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          common: {
            app_name: 'ResQ AI',
            sos: 'SOS EMERGENCY',
            get_help: 'GET HELP NOW',
            sign_in: 'Sign In',
            volunteer: 'Become a Volunteer',
          },
          nav: {
            map: 'Disaster Map',
            safe_zones: 'Safe Zones',
            reports: 'Incident Reports',
          },
          home: {
            hero_title: 'Emergency Alert System',
            hero_subtitle: 'Real-time disaster monitoring and emergency response coordination.',
            active_disasters: 'Active Disasters',
            verified_volunteers: 'Verified Volunteers',
            sos_resolved: 'SOS Requests Resolved',
          }
        }
      },
      hi: {
        translation: {
          common: {
            app_name: 'ResQ AI',
            sos: 'आपातकालीन सहायता (SOS)',
            get_help: 'अभी मदद लें',
            sign_in: 'साइन इन करें',
            volunteer: 'स्वयंसेवक बनें',
          },
          nav: {
            map: 'आपदा मानचित्र',
            safe_zones: 'सुरक्षित क्षेत्र',
            reports: 'घटना रिपोर्ट',
          },
          home: {
            hero_title: 'आपातकालीन अलर्ट प्रणाली',
            hero_subtitle: 'वास्तविक समय में आपदा निगरानी और आपातकालीन प्रतिक्रिया समन्वय।',
            active_disasters: 'सक्रिय आपदाएं',
            verified_volunteers: 'सत्यापित स्वयंसेवक',
            sos_resolved: 'SOS अनुरोध हल किए गए',
          }
        }
      },
      hinglish: {
        translation: {
          common: {
            app_name: 'ResQ AI',
            sos: 'Emergency SOS',
            get_help: 'Abhi help lein',
            sign_in: 'Sign In karein',
            volunteer: 'Volunteer banein',
          },
          nav: {
            map: 'Disaster Map',
            safe_zones: 'Safe Zones',
            reports: 'Incident Reports',
          },
          home: {
            hero_title: 'Emergency Alert System',
            hero_subtitle: 'Real-time disaster monitoring aur emergency response coordination.',
            active_disasters: 'Active Disasters',
            verified_volunteers: 'Verified Volunteers',
            sos_resolved: 'SOS Requests Resolved',
          }
        }
      }
    }
  })

export default i18n
