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
            volunteer: 'Volunteer',
            safe_zones: 'Safe Zones',
            reports: 'Incident Reports',
          },
          header: {
            dashboard: 'Dashboard',
            liveMap: 'Live Map',
            report: 'Report',
            profile: 'Profile',
            signIn: 'Sign In',
            commandCenter: 'Command Center',
            myTasks: 'My Tasks',
          },
          home: {
            hero_label: "INDIA'S EMERGENCY RESPONSE PLATFORM",
            hero_when: 'when',
            hero_seconds: 'seconds',
            hero_matter: 'matter,',
            hero_data: 'data',
            hero_saves: ' saves lives',
            hero_subtitle: 'AI-powered disaster coordination platform for a resilient India. Real-time. Everywhere. Always.',
            cta_sos: '🚨 Send SOS',
            cta_map: 'View Live Map →',
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
            volunteer: 'स्वयंसेवक',
            safe_zones: 'सुरक्षित क्षेत्र',
            reports: 'घटना रिपोर्ट',
          },
          header: {
            dashboard: 'डैशबोर्ड',
            liveMap: 'लाइव मैप',
            report: 'रिपोर्ट',
            profile: 'प्रोफ़ाइल',
            signIn: 'साइन इन',
            commandCenter: 'कमांड सेंटर',
            myTasks: 'मेरे कार्य',
          },
          home: {
            hero_label: 'भारत का आपातकालीन प्रतिक्रिया मंच',
            hero_when: 'जब',
            hero_seconds: 'सेकंड',
            hero_matter: 'कीमती हों,',
            hero_data: 'डेटा',
            hero_saves: ' जान बचाता है',
            hero_subtitle: 'एक लचीले भारत के लिए एआई-संचालित आपदा समन्वय मंच। वास्तविक समय। हर जगह। हमेशा।',
            cta_sos: '🚨 SOS भेजें',
            cta_map: 'लाइव मैप देखें →',
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
            volunteer: 'Volunteer',
            safe_zones: 'Safe Zones',
            reports: 'Incident Reports',
          },
          header: {
            dashboard: 'Dashboard',
            liveMap: 'Live Map',
            report: 'Report',
            profile: 'Profile',
            signIn: 'Sign In',
            commandCenter: 'Command Center',
            myTasks: 'My Tasks',
          },
          home: {
            hero_label: "INDIA'S EMERGENCY RESPONSE PLATFORM",
            hero_when: 'when',
            hero_seconds: 'seconds',
            hero_matter: 'matter karte hain,',
            hero_data: 'data',
            hero_saves: ' lives bachata hai',
            hero_subtitle: 'AI-powered disaster coordination platform for a resilient India. Real-time. Har jagah. Hamesha.',
            cta_sos: '🚨 SOS bhejein',
            cta_map: 'Live Map dekhein →',
          }
        }
      }
    }
  })

export default i18n
