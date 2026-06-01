#!/usr/bin/env python3
"""
Manual Translation Helper for ResQ AI
Helps translate specific keys manually with better context
"""

import json
from pathlib import Path
from googletrans import Translator
import time

LANGUAGES = {
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese'
}

# Core translations for ResQ AI
CORE_TRANSLATIONS = {
    'app_name': 'ResQ AI',
    'tagline': "India's Emergency Response Platform",
    
    # Hero Section
    'hero_label': "INDIA'S EMERGENCY RESPONSE PLATFORM",
    'hero_when': 'when',
    'hero_seconds': 'seconds',
    'hero_matter': 'matter,',
    'hero_data': 'data',
    'hero_saves': 'saves lives',
    'hero_subtitle': 'AI-powered disaster coordination platform for a resilient India. Real-time. Everywhere. Always.',
    'cta_sos': '🚨 Send SOS',
    'cta_map': 'View Live Map →',
    
    # Navigation
    'nav_home': 'Home',
    'nav_map': 'Live Map',
    'nav_sos': 'SOS',
    'nav_reports': 'Reports',
    'nav_volunteers': 'Volunteers',
    'nav_admin': 'Admin',
    'nav_login': 'Login',
    'nav_logout': 'Logout',
    
    # Features
    'features_title': 'purpose-built for crisis',
    'feature_realtime': 'Real-Time Monitoring',
    'feature_realtime_desc': 'Live data from USGS, IMD, NASA FIRMS - refreshed every 5 minutes.',
    'feature_sos': 'Sub-Second SOS',
    'feature_sos_desc': 'One tap sends GPS location to NDRF and nearby volunteers instantly.',
    'feature_ai': 'AI Risk Heatmaps',
    'feature_ai_desc': 'XGBoost flood prediction overlays with confidence intervals.',
    'feature_offline': 'Offline-First',
    'feature_offline_desc': 'Reports queue without internet, then sync cleanly on reconnect.',
    'feature_volunteers': 'Volunteer Network',
    'feature_volunteers_desc': 'Verified first responders dispatched within 5km using PostGIS.',
    'feature_command': 'Command Center',
    'feature_command_desc': 'Live incident management, resource allocation, and alert routing.',
    
    # Platform
    'platform_title': 'Real-time. Everywhere. Always.',
    'platform_live_map': 'Live Map',
    'platform_sos_engine': 'SOS Engine',
    'platform_volunteers': 'Volunteers',
    
    # Mission
    'mission_title': 'Mission',
    'mission_text': 'ResQ AI was built on a single belief: in the chaos of disaster, the right information delivered at the right time saves lives. We combine satellite data, AI prediction, and human networks to create India\'s most responsive emergency coordination platform.',
    
    # How It Works
    'how_it_works_title': 'the rescue lifecycle',
    'step_1_title': 'Citizen Reports',
    'step_1_desc': 'One-tap SOS with auto GPS location capture.',
    'step_2_title': 'AI Processing',
    'step_2_desc': 'Severity classification and resource allocation AI.',
    'step_3_title': 'Admin Verify',
    'step_3_desc': 'Command center confirms and escalates the incident.',
    'step_4_title': 'Dispatch',
    'step_4_desc': 'Nearest volunteers dispatched via PostGIS spatial query.',
    'step_5_title': 'Resolved',
    'step_5_desc': 'Incident closed, data logged, community notified.',
    
    # SOS Page
    'sos_title': 'Emergency SOS',
    'sos_subtitle': 'Hold the button for 1.5 seconds to activate emergency alert',
    'sos_activated': 'SOS Activated',
    'sos_sending': 'Sending your location to emergency services...',
    'sos_success': 'Help is on the way!',
    'sos_error': 'Failed to send SOS. Please try again.',
    
    # Map Page
    'map_title': 'Live Disaster Map',
    'map_loading': 'Loading disasters...',
    'map_no_disasters': 'No active disasters',
    'map_severity': 'Severity',
    'map_affected': 'People Affected',
    'map_radius': 'Impact Radius',
    
    # Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'close': 'Close',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'back': 'Back',
    'next': 'Next',
    'submit': 'Submit',
}

def translate_core():
    """Translate core application texts"""
    translator = Translator()
    locales_dir = Path('public/locales')
    locales_dir.mkdir(parents=True, exist_ok=True)
    
    # Save English
    en_dir = locales_dir / 'en'
    en_dir.mkdir(exist_ok=True)
    with open(en_dir / 'translation.json', 'w', encoding='utf-8') as f:
        json.dump(CORE_TRANSLATIONS, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved English translations")
    
    # Translate to other languages
    for lang_code, lang_name in LANGUAGES.items():
        print(f"\nTranslating to {lang_name}...")
        translations = {}
        
        for key, text in CORE_TRANSLATIONS.items():
            try:
                # Skip app name and technical terms
                if key in ['app_name'] or text.startswith('ResQ'):
                    translations[key] = text
                else:
                    result = translator.translate(text, src='en', dest=lang_code)
                    translations[key] = result.text
                    print(f"  {key}: {result.text[:50]}")
                    time.sleep(0.3)  # Rate limiting
            except Exception as e:
                print(f"  Error translating {key}: {e}")
                translations[key] = text
        
        # Save
        lang_dir = locales_dir / lang_code
        lang_dir.mkdir(exist_ok=True)
        with open(lang_dir / 'translation.json', 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Saved {lang_name} translations")

def main():
    print("=" * 60)
    print("ResQ AI - Manual Translation System")
    print("=" * 60)
    print(f"\nTranslating {len(CORE_TRANSLATIONS)} core texts")
    print(f"Target languages: {len(LANGUAGES)}")
    print("\nThis may take a few minutes...\n")
    
    translate_core()
    
    print("\n" + "=" * 60)
    print("Translation complete!")
    print("=" * 60)
    print("\nFiles saved to: public/locales/")
    print("\nNext steps:")
    print("1. Review translations in public/locales/")
    print("2. Update components to use t('key') for translations")
    print("3. Test language switching in the app")

if __name__ == '__main__':
    main()
