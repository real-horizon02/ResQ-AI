#!/usr/bin/env python3
"""
Automatic Translation Script for ResQ AI
Translates all text content across the application to multiple Indian languages
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set
from googletrans import Translator
import time

# Target languages for India
LANGUAGES = {
    'en': 'English',
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

class TranslationExtractor:
    """Extract translatable text from React/TypeScript files"""
    
    def __init__(self, src_dir: str = 'src'):
        self.src_dir = Path(src_dir)
        self.translator = Translator()
        self.translations: Dict[str, Dict[str, str]] = {}
        
    def extract_from_file(self, file_path: Path) -> Set[str]:
        """Extract text that needs translation from a file"""
        texts = set()
        
        try:
            content = file_path.read_text(encoding='utf-8')
            
            # Pattern 1: t('key') or {t('key')}
            pattern1 = r"t\(['\"]([^'\"]+)['\"]\)"
            texts.update(re.findall(pattern1, content))
            
            # Pattern 2: Direct text in JSX (between > and <)
            pattern2 = r'>\s*([A-Z][^<>{}\n]{3,100}?)\s*<'
            direct_texts = re.findall(pattern2, content)
            texts.update([t.strip() for t in direct_texts if t.strip() and not t.strip().startswith('{')])
            
            # Pattern 3: String literals in style objects
            pattern3 = r"['\"]([A-Z][^'\"]{10,100})['\"]\s*[,}]"
            texts.update(re.findall(pattern3, content))
            
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
        return texts
    
    def extract_all_texts(self) -> Set[str]:
        """Extract all translatable texts from the project"""
        all_texts = set()
        
        # Scan all TypeScript/React files
        for ext in ['*.tsx', '*.ts', '*.jsx', '*.js']:
            for file_path in self.src_dir.rglob(ext):
                if 'node_modules' not in str(file_path):
                    texts = self.extract_from_file(file_path)
                    all_texts.update(texts)
                    print(f"Extracted {len(texts)} texts from {file_path.name}")
        
        return all_texts
    
    def translate_text(self, text: str, target_lang: str, retry=3) -> str:
        """Translate a single text with retry logic"""
        for attempt in range(retry):
            try:
                result = self.translator.translate(text, src='en', dest=target_lang)
                time.sleep(0.5)  # Rate limiting
                return result.text
            except Exception as e:
                print(f"Translation error (attempt {attempt + 1}/{retry}): {e}")
                time.sleep(2)
        
        return text  # Return original if translation fails
    
    def translate_all(self, texts: Set[str]) -> Dict[str, Dict[str, str]]:
        """Translate all texts to all target languages"""
        translations = {lang: {} for lang in LANGUAGES.keys()}
        
        total = len(texts)
        for idx, text in enumerate(sorted(texts), 1):
            print(f"\nTranslating ({idx}/{total}): {text[:50]}...")
            
            # Generate a key from the text
            key = self.generate_key(text)
            
            # English is the source
            translations['en'][key] = text
            
            # Translate to other languages
            for lang_code in LANGUAGES.keys():
                if lang_code == 'en':
                    continue
                    
                translated = self.translate_text(text, lang_code)
                translations[lang_code][key] = translated
                print(f"  {LANGUAGES[lang_code]}: {translated[:50]}")
        
        return translations
    
    def generate_key(self, text: str) -> str:
        """Generate a translation key from text"""
        # Convert to snake_case
        key = text.lower()
        key = re.sub(r'[^a-z0-9]+', '_', key)
        key = key.strip('_')
        return key[:50]  # Limit length
    
    def save_translations(self, translations: Dict[str, Dict[str, str]]):
        """Save translations to JSON files"""
        locales_dir = Path('public/locales')
        locales_dir.mkdir(parents=True, exist_ok=True)
        
        for lang_code, texts in translations.items():
            lang_dir = locales_dir / lang_code
            lang_dir.mkdir(exist_ok=True)
            
            translation_file = lang_dir / 'translation.json'
            
            # Load existing translations if any
            existing = {}
            if translation_file.exists():
                with open(translation_file, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            
            # Merge with new translations
            existing.update(texts)
            
            # Save
            with open(translation_file, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
            
            print(f"\nSaved {len(existing)} translations for {LANGUAGES[lang_code]}")

def main():
    print("=" * 60)
    print("ResQ AI - Automatic Translation System")
    print("=" * 60)
    
    extractor = TranslationExtractor()
    
    print("\n[1/3] Extracting translatable texts...")
    texts = extractor.extract_all_texts()
    print(f"\nFound {len(texts)} unique texts to translate")
    
    print("\n[2/3] Translating to all languages...")
    translations = extractor.translate_all(texts)
    
    print("\n[3/3] Saving translations...")
    extractor.save_translations(translations)
    
    print("\n" + "=" * 60)
    print("Translation complete!")
    print("=" * 60)
    print("\nTranslation files saved to: public/locales/")
    print(f"Languages: {', '.join(LANGUAGES.values())}")

if __name__ == '__main__':
    main()
