#!/usr/bin/env python3
"""
Generate i18n configuration with dynamic language loading
Creates an i18n config that supports multiple languages
"""

import json
from pathlib import Path
from typing import Dict, Any

def generate_i18n_config():
    """Generate the i18n TypeScript configuration file"""
    
    config_content = '''import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

// Import translation resources
import enTranslation from './locales/en/translation.json'
import hiTranslation from './locales/hi/translation.json'
import hinglishTranslation from './locales/hinglish/translation.json'

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
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
'''
    
    config_path = Path("src/i18n/config.ts")
    config_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(config_content)
    
    print(f"✓ Generated i18n config: {config_path}")

def generate_language_files():
    """Generate translation files for each language"""
    
    base_dir = Path("src/i18n/locales")
    base_dir.mkdir(parents=True, exist_ok=True)
    
    languages = {
        "en": {
            "common": {
                "app_name": "ResQ AI",
                "sos": "SOS EMERGENCY",
                "get_help": "GET HELP NOW",
                "sign_in": "Sign In",
                "volunteer": "Become a Volunteer",
                "language": "Language",
                "select_language": "Select Language",
            },
            "nav": {
                "home": "Home",
                "map": "Disaster Map",
                "volunteer": "Volunteer Hub",
                "safe_zones": "Safe Zones",
                "reports": "Incident Reports",
                "admin": "Admin Dashboard",
            },
            "header": {
                "dashboard": "Dashboard",
                "liveMap": "Live Map",
                "report": "Report Incident",
                "profile": "Profile",
                "signIn": "Sign In",
                "signUp": "Sign Up",
                "commandCenter": "Command Center",
                "myTasks": "My Tasks",
                "logout": "Logout",
            },
            "home": {
                "hero_label": "INDIA'S EMERGENCY RESPONSE PLATFORM",
                "hero_when": "when",
                "hero_seconds": "seconds",
                "hero_matter": "matter,",
                "hero_data": "data",
                "hero_saves": "saves lives",
                "hero_subtitle": "AI-powered disaster coordination platform for a resilient India.",
                "hero_tagline": "Real-time. Everywhere. Always.",
                "cta_sos": "🚨 Send SOS",
                "cta_map": "View Live Map →",
                "features": "Key Features",
                "realtime": "Real-Time Monitoring",
                "offline": "Offline First",
                "ai_powered": "AI-Powered Predictions",
            },
            "map": {
                "title": "Live Disaster Map",
                "loading": "Loading map data...",
                "active_incidents": "Active Incidents",
                "filter_by": "Filter by",
                "zoom_in": "Zoom In",
                "zoom_out": "Zoom Out",
                "view_details": "View Details",
                "nearby": "Nearby Safe Zones",
                "distance": "Distance",
                "severity": "Severity",
                "high": "High",
                "medium": "Medium",
                "low": "Low",
            },
            "volunteer": {
                "title": "Volunteer Dashboard",
                "available_tasks": "Available Tasks",
                "my_tasks": "My Tasks",
                "completed_tasks": "Completed Tasks",
                "task_details": "Task Details",
                "accept_task": "Accept Task",
                "complete_task": "Mark as Complete",
                "location": "Location",
                "priority": "Priority",
                "urgent": "Urgent",
                "high": "High",
                "normal": "Normal",
                "status": "Status",
                "pending": "Pending",
                "in_progress": "In Progress",
                "completed": "Completed",
            },
            "sos": {
                "title": "Send SOS",
                "emergency_message": "Emergency Alert",
                "describe_situation": "Describe your situation",
                "select_location": "Select your location",
                "attach_media": "Attach photo or video",
                "submit_report": "Submit Report",
                "emergency_services": "Emergency Services",
                "nearest_help": "Nearest Help",
                "response_time": "Response Time",
                "calling_help": "Calling for help...",
                "help_on_way": "Help is on the way!",
            },
            "profile": {
                "title": "Profile",
                "edit_profile": "Edit Profile",
                "name": "Name",
                "email": "Email",
                "phone": "Phone",
                "location": "Location",
                "skills": "Skills",
                "preferences": "Preferences",
                "notifications": "Notifications",
                "language": "Language",
                "theme": "Theme",
                "save_changes": "Save Changes",
                "cancel": "Cancel",
            },
            "admin": {
                "title": "Admin Dashboard",
                "incidents": "Incidents",
                "verify_incident": "Verify Incident",
                "assign_volunteers": "Assign Volunteers",
                "update_status": "Update Status",
                "resolved": "Resolved",
                "pending": "Pending",
                "in_progress": "In Progress",
                "statistics": "Statistics",
                "total_incidents": "Total Incidents",
                "active_volunteers": "Active Volunteers",
                "response_time": "Avg Response Time",
            },
            "auth": {
                "login": "Login",
                "logout": "Logout",
                "signup": "Sign Up",
                "email": "Email",
                "password": "Password",
                "confirm_password": "Confirm Password",
                "remember_me": "Remember Me",
                "forgot_password": "Forgot Password",
                "dont_have_account": "Don't have an account?",
                "already_have_account": "Already have an account?",
                "login_with_google": "Login with Google",
                "login_with_phone": "Login with Phone",
            },
            "common_actions": {
                "save": "Save",
                "cancel": "Cancel",
                "delete": "Delete",
                "edit": "Edit",
                "close": "Close",
                "submit": "Submit",
                "search": "Search",
                "filter": "Filter",
                "sort": "Sort",
                "view": "View",
                "download": "Download",
                "share": "Share",
                "back": "Back",
                "next": "Next",
                "previous": "Previous",
                "ok": "OK",
                "yes": "Yes",
                "no": "No",
                "confirm": "Confirm",
                "loading": "Loading...",
                "error": "Error",
                "success": "Success",
                "warning": "Warning",
            }
        },
        "hi": {
            "common": {
                "app_name": "ResQ AI",
                "sos": "SOS आपातकाल",
                "get_help": "अभी मदद लें",
                "sign_in": "साइन इन करें",
                "volunteer": "स्वेच्छासेवक बनें",
                "language": "भाषा",
                "select_language": "भाषा चुनें",
            },
            "nav": {
                "home": "होम",
                "map": "आपदा मानचित्र",
                "volunteer": "स्वेच्छासेवक केंद्र",
                "safe_zones": "सुरक्षित क्षेत्र",
                "reports": "घटना रिपोर्ट",
                "admin": "प्रशासक डैशबोर्ड",
            },
            "header": {
                "dashboard": "डैशबोर्ड",
                "liveMap": "लाइव मानचित्र",
                "report": "घटना की रिपोर्ट करें",
                "profile": "प्रोफ़ाइल",
                "signIn": "साइन इन करें",
                "signUp": "साइन अप करें",
                "commandCenter": "कमांड सेंटर",
                "myTasks": "मेरे कार्य",
                "logout": "लॉग आउट करें",
            },
            "home": {
                "hero_label": "भारत का आपातकालीन प्रतिक्रिया मंच",
                "hero_when": "जब",
                "hero_seconds": "सेकंड",
                "hero_matter": "महत्वपूर्ण",
                "hero_data": "डेटा",
                "hero_saves": "जीवन बचाता है",
                "hero_subtitle": "भारत के लचीलेपन के लिए एआई-संचालित आपदा समन्वय मंच।",
                "hero_tagline": "रीयल-टाइम। हर जगह। हमेशा।",
                "cta_sos": "🚨 SOS भेजें",
                "cta_map": "लाइव मानचित्र देखें →",
                "features": "मुख्य विशेषताएं",
                "realtime": "रीयल-टाइम निगरानी",
                "offline": "ऑफलाइन प्रथम",
                "ai_powered": "एआई-संचालित भविष्यवाणियां",
            },
            "map": {
                "title": "लाइव आपदा मानचित्र",
                "loading": "मानचित्र डेटा लोड हो रहा है...",
                "active_incidents": "सक्रिय घटनाएं",
                "filter_by": "द्वारा फ़िल्टर करें",
                "zoom_in": "बड़ा करें",
                "zoom_out": "छोटा करें",
                "view_details": "विवरण देखें",
                "nearby": "पास के सुरक्षित क्षेत्र",
                "distance": "दूरी",
                "severity": "गंभीरता",
                "high": "उच्च",
                "medium": "मध्यम",
                "low": "कम",
            },
            "volunteer": {
                "title": "स्वेच्छासेवक डैशबोर्ड",
                "available_tasks": "उपलब्ध कार्य",
                "my_tasks": "मेरे कार्य",
                "completed_tasks": "पूर्ण किए गए कार्य",
                "task_details": "कार्य विवरण",
                "accept_task": "कार्य स्वीकार करें",
                "complete_task": "पूर्ण के रूप में चिह्नित करें",
                "location": "स्थान",
                "priority": "प्राथमिकता",
                "urgent": "तुरंत",
                "high": "उच्च",
                "normal": "सामान्य",
                "status": "स्थिति",
                "pending": "लंबित",
                "in_progress": "प्रगति में",
                "completed": "पूर्ण",
            },
            "sos": {
                "title": "SOS भेजें",
                "emergency_message": "आपातकालीन चेतावनी",
                "describe_situation": "अपनी स्थिति का वर्णन करें",
                "select_location": "अपना स्थान चुनें",
                "attach_media": "फोटो या वीडियो संलग्न करें",
                "submit_report": "रिपोर्ट जमा करें",
                "emergency_services": "आपातकालीन सेवाएं",
                "nearest_help": "निकटतम मदद",
                "response_time": "प्रतिक्रिया समय",
                "calling_help": "मदद के लिए कॉल कर रहे हैं...",
                "help_on_way": "मदद रास्ते में है!",
            },
            "profile": {
                "title": "प्रोफ़ाइल",
                "edit_profile": "प्रोफ़ाइल संपादित करें",
                "name": "नाम",
                "email": "ईमेल",
                "phone": "फोन",
                "location": "स्थान",
                "skills": "कौशल",
                "preferences": "वरीयताएं",
                "notifications": "सूचनाएं",
                "language": "भाषा",
                "theme": "थीम",
                "save_changes": "परिवर्तन सहेजें",
                "cancel": "रद्द करें",
            },
            "admin": {
                "title": "प्रशासक डैशबोर्ड",
                "incidents": "घटनाएं",
                "verify_incident": "घटना सत्यापित करें",
                "assign_volunteers": "स्वेच्छासेवकों को असाइन करें",
                "update_status": "स्थिति अपडेट करें",
                "resolved": "समाधान",
                "pending": "लंबित",
                "in_progress": "प्रगति में",
                "statistics": "आंकड़े",
                "total_incidents": "कुल घटनाएं",
                "active_volunteers": "सक्रिय स्वेच्छासेवक",
                "response_time": "औसत प्रतिक्रिया समय",
            },
            "auth": {
                "login": "लॉगिन",
                "logout": "लॉग आउट",
                "signup": "साइन अप",
                "email": "ईमेल",
                "password": "पासवर्ड",
                "confirm_password": "पासवर्ड की पुष्टि करें",
                "remember_me": "मुझे याद रखें",
                "forgot_password": "पासवर्ड भूल गए?",
                "dont_have_account": "खाता नहीं है?",
                "already_have_account": "पहले से खाता है?",
                "login_with_google": "Google के साथ लॉगिन करें",
                "login_with_phone": "फोन के साथ लॉगिन करें",
            },
            "common_actions": {
                "save": "सहेजें",
                "cancel": "रद्द करें",
                "delete": "हटाएं",
                "edit": "संपादित करें",
                "close": "बंद करें",
                "submit": "जमा करें",
                "search": "खोज",
                "filter": "फ़िल्टर",
                "sort": "छाँटें",
                "view": "देखें",
                "download": "डाउनलोड",
                "share": "साझा करें",
                "back": "वापस",
                "next": "अगला",
                "previous": "पिछला",
                "ok": "ठीक है",
                "yes": "हाँ",
                "no": "नहीं",
                "confirm": "पुष्टि करें",
                "loading": "लोड हो रहा है...",
                "error": "त्रुटि",
                "success": "सफल",
                "warning": "चेतावनी",
            }
        },
        "hinglish": {
            "common": {
                "app_name": "ResQ AI",
                "sos": "SOS Aapatkaaleen",
                "get_help": "Ab Madad Lo",
                "sign_in": "Sign In Karo",
                "volunteer": "Volunteer Bano",
                "language": "Bhasha",
                "select_language": "Bhasha Chunna",
            },
            "nav": {
                "home": "Ghar",
                "map": "Aapadaa Map",
                "volunteer": "Volunteer Kendra",
                "safe_zones": "Surakshit Kshetr",
                "reports": "Ghatna Reports",
                "admin": "Admin Dashboard",
            },
            "header": {
                "dashboard": "Dashboard",
                "liveMap": "Live Map",
                "report": "Ghatna Report Karo",
                "profile": "Profile",
                "signIn": "Sign In Karo",
                "signUp": "Sign Up Karo",
                "commandCenter": "Command Center",
                "myTasks": "Mere Kaam",
                "logout": "Log Out Karo",
            },
            "home": {
                "hero_label": "Bharat Ka Aapatkaaleen Pratikrya Manch",
                "hero_when": "Jab",
                "hero_seconds": "Sekand",
                "hero_matter": "Mahatvpurn",
                "hero_data": "Data",
                "hero_saves": "Jeevan Bachata Hai",
                "hero_subtitle": "Bharat Ke Liye AI se Sanchaalit Aapadaa Smanvay Manch.",
                "hero_tagline": "Real-Time. Har Jagah. Hamesha.",
                "cta_sos": "🚨 SOS Bhejo",
                "cta_map": "Live Map Dekho →",
                "features": "Khaas Baatein",
                "realtime": "Real-Time Niyantran",
                "offline": "Offline Pehle",
                "ai_powered": "AI se Sanchaalit Bhavishyavani",
            },
            "map": {
                "title": "Live Aapadaa Map",
                "loading": "Map Data Load Ho Raha Hai...",
                "active_incidents": "Chalti Hui Ghatayen",
                "filter_by": "Filter Karo",
                "zoom_in": "Bada Karo",
                "zoom_out": "Chhota Karo",
                "view_details": "Vivran Dekho",
                "nearby": "Paas Ke Surakshit Kshetr",
                "distance": "Doori",
                "severity": "Gambhirta",
                "high": "Zyada",
                "medium": "Madhyam",
                "low": "Kam",
            },
            "volunteer": {
                "title": "Volunteer Dashboard",
                "available_tasks": "Upla bh Kaam",
                "my_tasks": "Mere Kaam",
                "completed_tasks": "Purn Kiye Gaye Kaam",
                "task_details": "Kaam Ka Vivran",
                "accept_task": "Kaam Sweekar Karo",
                "complete_task": "Purn Ke Roop Mein Chihnit Karo",
                "location": "Sthaan",
                "priority": "Prathamikta",
                "urgent": "Turant",
                "high": "Zyada",
                "normal": "Samanya",
                "status": "Sthiti",
                "pending": "Sambhavit",
                "in_progress": "Chal Raha Hai",
                "completed": "Purn",
            },
            "sos": {
                "title": "SOS Bhejo",
                "emergency_message": "Aapatkaaleen Chetavni",
                "describe_situation": "Apni Sthiti Ka Varnan Karo",
                "select_location": "Apna Sthaan Chunna",
                "attach_media": "Photo Ya Video Jodha",
                "submit_report": "Report Jama Karo",
                "emergency_services": "Aapatkaaleen Sevayen",
                "nearest_help": "Nikattam Madad",
                "response_time": "Pratikrya Samay",
                "calling_help": "Madad Ke Liye Call Ho Raha Hai...",
                "help_on_way": "Madad Raaste Mein Hai!",
            },
            "profile": {
                "title": "Profile",
                "edit_profile": "Profile Sambhaalo",
                "name": "Naam",
                "email": "Email",
                "phone": "Fone",
                "location": "Sthaan",
                "skills": "Kushalta",
                "preferences": "Pasand",
                "notifications": "Suchiyen",
                "language": "Bhasha",
                "theme": "Thheem",
                "save_changes": "Badlav Sambhalo",
                "cancel": "Cancel Karo",
            },
            "admin": {
                "title": "Admin Dashboard",
                "incidents": "Ghatayen",
                "verify_incident": "Ghatna Satthapit Karo",
                "assign_volunteers": "Volunteers Ko Saunpen",
                "update_status": "Sthiti Update Karo",
                "resolved": "Samadhan",
                "pending": "Sambhavit",
                "in_progress": "Chal Raha Hai",
                "statistics": "Ankde",
                "total_incidents": "Kul Ghatayen",
                "active_volunteers": "Chalte Aman Sewak",
                "response_time": "Average Pratikrya Samay",
            },
            "auth": {
                "login": "Login Karo",
                "logout": "Logout Karo",
                "signup": "Sign Up Karo",
                "email": "Email",
                "password": "Password",
                "confirm_password": "Password Ki Pushti Karo",
                "remember_me": "Mujhe Yaad Rakho",
                "forgot_password": "Password Bhul Gaye?",
                "dont_have_account": "Account Nahi Hai?",
                "already_have_account": "Pehle Se Account Hai?",
                "login_with_google": "Google Se Login Karo",
                "login_with_phone": "Phone Se Login Karo",
            },
            "common_actions": {
                "save": "Sambhalo",
                "cancel": "Cancel Karo",
                "delete": "Hata Do",
                "edit": "Sambhaalo",
                "close": "Band Karo",
                "submit": "Jama Karo",
                "search": "Khojo",
                "filter": "Filter Karo",
                "sort": "Tarteeb Do",
                "view": "Dekho",
                "download": "Download Karo",
                "share": "Share Karo",
                "back": "Peeche",
                "next": "Agle",
                "previous": "Pichle",
                "ok": "Theek Hai",
                "yes": "Haan",
                "no": "Nahi",
                "confirm": "Pushti Karo",
                "loading": "Load Ho Raha Hai...",
                "error": "Galti",
                "success": "Safal",
                "warning": "Chetavni",
            }
        }
    }
    
    # Create translation files for each language
    for lang, translations in languages.items():
        lang_dir = base_dir / lang
        lang_dir.mkdir(parents=True, exist_ok=True)
        
        translation_file = lang_dir / "translation.json"
        with open(translation_file, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Generated {lang} translations: {translation_file}")

def main():
    print("🌍 Generating i18n Configuration")
    print("=" * 50)
    
    generate_i18n_config()
    generate_language_files()
    
    print("\n✅ i18n configuration generated successfully!")
    print("\n📝 Next steps:")
    print("   1. Import i18n in your main.tsx:")
    print("      import './i18n/config'")
    print("   2. Use useTranslation hook in components:")
    print("      const { t } = useTranslation()")
    print("   3. Test language switching in the app")

if __name__ == "__main__":
    main()
