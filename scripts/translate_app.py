#!/usr/bin/env python3
"""
ResQ AI Website Translator
Translates the entire website from English to Hindi and Hinglish
Supports all React components and pages across the application
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any
from collections import defaultdict

try:
    from google.cloud import translate_v2
    from google.oauth2 import service_account
except ImportError:
    print("WARNING: google-cloud-translate not installed. Install with: pip install google-cloud-translate")
    print("Falling back to offline translation...")

class WebsiteTranslator:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.src_dir = self.project_root / "src"
        self.i18n_dir = self.src_dir / "i18n"
        self.extract_strings: Dict[str, List[str]] = defaultdict(list)
        self.translations: Dict[str, Dict[str, str]] = {
            "en": {},
            "hi": {},
            "hinglish": {}
        }
        
    def extract_strings_from_files(self) -> Dict[str, Any]:
        """
        Extract all translatable strings from React/TypeScript files
        Looks for patterns like:
        - i18n.t('key')
        - t('key')
        - translation keys
        - Common hardcoded strings
        """
        print("📝 Extracting translatable strings from codebase...")
        
        patterns = [
            r"t\(['\"]([^'\"]+)['\"]\)",  # t('key') or t("key")
            r"i18n\.t\(['\"]([^'\"]+)['\"]\)",  # i18n.t('key')
            r"translation['\"]:\s*\{([^}]+)\}",  # translation object
            r"content['\"]:\s*['\"]([^'\"]+)['\"]",  # content field
            r"placeholder['\"]:\s*['\"]([^'\"]+)['\"]",  # placeholder field
            r"label['\"]:\s*['\"]([^'\"]+)['\"]",  # label field
            r"title['\"]:\s*['\"]([^'\"]+)['\"]",  # title field
            r"description['\"]:\s*['\"]([^'\"]+)['\"]",  # description field
        ]
        
        extracted_strings = defaultdict(set)
        
        # Scan all TypeScript/TSX and JavaScript files
        for file_path in self.src_dir.rglob("*"):
            if file_path.suffix in [".tsx", ".ts", ".jsx", ".js"]:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        for pattern in patterns:
                            matches = re.findall(pattern, content)
                            for match in matches:
                                # Filter out very short or template literals
                                if len(match) > 2 and "${" not in match:
                                    extracted_strings[file_path.name].add(match)
                except Exception as e:
                    print(f"  ⚠️  Error reading {file_path}: {e}")
        
        print(f"✓ Found {sum(len(v) for v in extracted_strings.values())} translatable strings")
        return extracted_strings
    
    def translate_text(self, text: str, target_language: str = "hi") -> str:
        """
        Translate text to target language
        target_language: 'hi' for Hindi or 'hinglish' for Hinglish
        """
        try:
            # Try using Google Translate API if credentials available
            if self._has_translate_api():
                return self._translate_with_api(text, target_language)
        except Exception as e:
            print(f"  Translation API error: {e}")
        
        # Fallback to offline translation mapping
        return self._translate_offline(text, target_language)
    
    def _has_translate_api(self) -> bool:
        """Check if Google Translate API credentials are available"""
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        return creds_path and os.path.exists(creds_path)
    
    def _translate_with_api(self, text: str, target_lang: str) -> str:
        """Use Google Translate API"""
        try:
            translate_client = translate_v2.Client()
            result = translate_client.translate_text(
                text,
                target_language="hi" if target_lang != "hinglish" else "hi"
            )
            return result["translatedText"]
        except Exception as e:
            print(f"  API translation failed: {e}")
            return text
    
    def _translate_offline(self, text: str, target_lang: str) -> str:
        """Offline translation using predefined mappings"""
        # Common translation mappings
        mappings = {
            "hi": self._get_hindi_mappings(),
            "hinglish": self._get_hinglish_mappings()
        }
        
        mapping = mappings.get(target_lang, {})
        
        # Try to find exact match or partial match
        if text in mapping:
            return mapping[text]
        
        # Try lowercase match
        lower_text = text.lower()
        for key, value in mapping.items():
            if key.lower() == lower_text:
                return value
        
        # If no match found, return original text with note
        return f"[TRANSLATE: {text}]"
    
    def _get_hindi_mappings(self) -> Dict[str, str]:
        """Common English to Hindi translations"""
        return {
            "SOS": "SOS",
            "SOS EMERGENCY": "SOS आपातकाल",
            "GET HELP NOW": "अभी मदद लें",
            "Sign In": "साइन इन करें",
            "Become a Volunteer": "स्वेच्छासेवक बनें",
            "Disaster Map": "आपदा मानचित्र",
            "Volunteer": "स्वेच्छासेवक",
            "Safe Zones": "सुरक्षित क्षेत्र",
            "Incident Reports": "घटना रिपोर्ट",
            "Dashboard": "डैशबोर्ड",
            "Live Map": "लाइव मानचित्र",
            "Report": "रिपोर्ट करें",
            "Profile": "प्रोफ़ाइल",
            "Command Center": "कमांड सेंटर",
            "My Tasks": "मेरे कार्य",
            "Home": "होम",
            "Map": "मानचित्र",
            "Help": "मदद",
            "Settings": "सेटिंग्स",
            "Logout": "लॉग आउट",
            "Login": "लॉगिन",
            "Search": "खोज",
            "Cancel": "रद्द करें",
            "Submit": "जमा करें",
            "Save": "सहेजें",
            "Delete": "हटाएं",
            "Edit": "संपादित करें",
            "Close": "बंद करें",
            "Loading": "लोड हो रहा है",
            "Error": "त्रुटि",
            "Success": "सफल",
            "Warning": "चेतावनी",
            "No data available": "कोई डेटा उपलब्ध नहीं",
            "Are you sure": "क्या आप सुनिश्चित हैं",
            "Yes": "हाँ",
            "No": "नहीं",
            "OK": "ठीक है",
            "INDIA'S EMERGENCY RESPONSE PLATFORM": "भारत का आपातकालीन प्रतिक्रिया मंच",
            "AI-powered disaster coordination platform": "एआई-संचालित आपदा समन्वय मंच",
            "Real-time. Everywhere. Always.": "रीयल-टाइम। हर जगह। हमेशा।",
            "when": "जब",
            "seconds": "सेकंड",
            "matter": "महत्वपूर्ण",
            "data": "डेटा",
            "saves lives": "जीवन बचाता है",
            "Send SOS": "SOS भेजें",
            "View Live Map": "लाइव मानचित्र देखें",
        }
    
    def _get_hinglish_mappings(self) -> Dict[str, str]:
        """Common English to Hinglish (Roman Hindi) translations"""
        return {
            "SOS": "SOS",
            "SOS EMERGENCY": "SOS Aapatkaaleen",
            "GET HELP NOW": "Ab Madad Lo",
            "Sign In": "Sign In Karo",
            "Become a Volunteer": "Volunteer Bano",
            "Disaster Map": "Aapadaa Map",
            "Volunteer": "Volunteer",
            "Safe Zones": "Surakshit Kshetr",
            "Incident Reports": "Ghatna Reports",
            "Dashboard": "Dashboard",
            "Live Map": "Live Map",
            "Report": "Report Karo",
            "Profile": "Profile",
            "Command Center": "Command Center",
            "My Tasks": "Mere Kaam",
            "Home": "Ghar",
            "Map": "Map",
            "Help": "Madad",
            "Settings": "Settings",
            "Logout": "Log Out Karo",
            "Login": "Log In Karo",
            "Search": "Khojo",
            "Cancel": "Cancel",
            "Submit": "Jama Karo",
            "Save": "Save Karo",
            "Delete": "Delete Karo",
            "Edit": "Edit Karo",
            "Close": "Band Karo",
            "Loading": "Load Ho Raha Hai",
            "Error": "Galti",
            "Success": "Safal",
            "Warning": "Chetavni",
            "No data available": "Koi Data Nahi Hai",
            "Are you sure": "Kya Aap Sure Ho",
            "Yes": "Haan",
            "No": "Nahi",
            "OK": "Theek Hai",
            "INDIA'S EMERGENCY RESPONSE PLATFORM": "Bharat Ka Aapatkaaleen Pratikrya Manch",
            "AI-powered disaster coordination platform": "AI se Sanchaalit Aapadaa Smanvay Manch",
            "Real-time. Everywhere. Always.": "Real-Time. Har Jagah. Hamesha.",
            "when": "Jab",
            "seconds": "Sekand",
            "matter": "Mahatvpurn",
            "data": "Data",
            "saves lives": "Jeevan Bachata Hai",
            "Send SOS": "SOS Bhejo",
            "View Live Map": "Live Map Dekho",
        }
    
    def generate_translation_files(self, output_dir: str = None):
        """Generate i18n translation JSON files"""
        if output_dir is None:
            output_dir = str(self.i18n_dir)
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📄 Generating translation files in {output_dir}...")
        
        # Create language directories
        for lang in ["en", "hi", "hinglish"]:
            lang_dir = output_path / lang
            lang_dir.mkdir(exist_ok=True)
            
            # Create translation file
            translation_file = lang_dir / "translation.json"
            
            translations = self._get_language_translations(lang)
            
            with open(translation_file, 'w', encoding='utf-8') as f:
                json.dump(translations, f, ensure_ascii=False, indent=2)
            
            print(f"  ✓ Generated {lang}/translation.json ({len(translations)} strings)")
    
    def _get_language_translations(self, lang: str) -> Dict[str, Any]:
        """Get all translations for a specific language"""
        base_translations = self._get_base_translations()
        
        if lang == "en":
            return base_translations
        
        # Translate all values
        translated = {}
        mappings = self._get_hindi_mappings() if lang == "hi" else self._get_hinglish_mappings()
        
        def translate_dict(d: Dict, mapping: Dict) -> Dict:
            result = {}
            for key, value in d.items():
                if isinstance(value, dict):
                    result[key] = translate_dict(value, mapping)
                elif isinstance(value, str):
                    result[key] = mapping.get(value, self._translate_offline(value, lang))
                else:
                    result[key] = value
            return result
        
        return translate_dict(base_translations, mappings)
    
    def _get_base_translations(self) -> Dict[str, Any]:
        """Get base English translations"""
        return {
            "common": {
                "app_name": "ResQ AI",
                "sos": "SOS EMERGENCY",
                "get_help": "GET HELP NOW",
                "sign_in": "Sign In",
                "volunteer": "Become a Volunteer",
            },
            "nav": {
                "map": "Disaster Map",
                "volunteer": "Volunteer",
                "safe_zones": "Safe Zones",
                "reports": "Incident Reports",
            },
            "header": {
                "dashboard": "Dashboard",
                "liveMap": "Live Map",
                "report": "Report",
                "profile": "Profile",
                "signIn": "Sign In",
                "commandCenter": "Command Center",
                "myTasks": "My Tasks",
            },
            "home": {
                "hero_label": "INDIA'S EMERGENCY RESPONSE PLATFORM",
                "hero_when": "when",
                "hero_seconds": "seconds",
                "hero_matter": "matter,",
                "hero_data": "data",
                "hero_saves": "saves lives",
                "hero_subtitle": "AI-powered disaster coordination platform for a resilient India. Real-time. Everywhere. Always.",
                "cta_sos": "🚨 Send SOS",
                "cta_map": "View Live Map →",
            },
            "auth": {
                "login": "Login",
                "logout": "Logout",
                "signup": "Sign Up",
                "email": "Email",
                "password": "Password",
                "remember_me": "Remember Me",
                "forgot_password": "Forgot Password",
            },
            "errors": {
                "loading": "Loading",
                "error": "Error",
                "not_found": "Not Found",
                "unauthorized": "Unauthorized",
                "server_error": "Server Error",
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
            }
        }

def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ResQ AI Website Translator")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    parser.add_argument("--output-dir", default=None, help="Output directory for translation files")
    parser.add_argument("--extract-only", action="store_true", help="Only extract strings, don't generate files")
    
    args = parser.parse_args()
    
    print("🌍 ResQ AI Website Translator")
    print("=" * 50)
    
    translator = WebsiteTranslator(args.project_root)
    
    # Extract strings
    extracted = translator.extract_strings_from_files()
    
    if args.extract_only:
        print("\n📋 Extracted Strings:")
        for file, strings in extracted.items():
            print(f"\n  {file}:")
            for string in sorted(strings)[:5]:
                print(f"    - {string}")
            if len(strings) > 5:
                print(f"    ... and {len(strings) - 5} more")
    else:
        # Generate translation files
        translator.generate_translation_files(args.output_dir)
        
        print("\n✅ Translation files generated successfully!")
        print("   Supported languages: English (en), Hindi (hi), Hinglish (hinglish)")
        print("\n📝 Next steps:")
        print("   1. Update your i18n config to load these translation files")
        print("   2. Test translations in the browser")
        print("   3. Refine any machine translations manually")

if __name__ == "__main__":
    main()
