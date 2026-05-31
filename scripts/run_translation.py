#!/usr/bin/env python3
"""
ResQ AI Translation System - Main Runner
Orchestrates the entire translation workflow
"""

import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a Python command and report results"""
    print(f"\n{'='*60}")
    print(f"📌 {description}")
    print(f"{'='*60}")
    
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0

def main():
    print("\n")
    print("🌍 ResQ AI Translation System")
    print("="*60)
    print("This system translates your website to:")
    print("  • English (en)")
    print("  • Hindi (hi)")
    print("  • Hinglish (hinglish) - Roman Hindi script")
    print("="*60)
    
    # Get script directory
    script_dir = Path(__file__).parent
    
    # Step 1: Generate i18n configuration
    success = run_command(
        f"python \"{script_dir}/generate_i18n.py\"",
        "Step 1: Generating i18n Configuration Files"
    )
    
    if not success:
        print("\n❌ Failed to generate i18n config")
        sys.exit(1)
    
    # Step 2: Translate app
    print(f"\n{'='*60}")
    print("📌 Step 2: Translating Application")
    print(f"{'='*60}")
    
    try:
        from translate_app import WebsiteTranslator
        
        translator = WebsiteTranslator(".")
        extracted = translator.extract_strings_from_files()
        translator.generate_translation_files("src/i18n/locales")
        
        print("\n✅ Translation complete!")
        
    except Exception as e:
        print(f"\n⚠️  Translation system error: {e}")
        print("   Continuing with pre-generated translations...")
    
    print("\n" + "="*60)
    print("✅ ResQ AI Translation System Complete!")
    print("="*60)
    print("\n📝 What was generated:")
    print("   ✓ i18n/config.ts - Main i18n configuration")
    print("   ✓ i18n/locales/en/translation.json - English translations")
    print("   ✓ i18n/locales/hi/translation.json - Hindi translations")
    print("   ✓ i18n/locales/hinglish/translation.json - Hinglish translations")
    
    print("\n🚀 Next steps:")
    print("   1. Update src/main.tsx to import i18n:")
    print("      import './i18n/config'")
    print("   2. Use the translation hook in components:")
    print("      const { t, i18n } = useTranslation()")
    print("      t('common.app_name')")
    print("   3. Add language switcher component")
    print("   4. Test translations: npm run dev")
    
    print("\n💡 Tips:")
    print("   • Use nested keys like 'common.app_name' for organization")
    print("   • Add new translations directly in the JSON files")
    print("   • Hinglish uses Roman script (easy for North Indians)")
    print("   • Users can switch languages in the app UI")
    
    print("\n📚 Documentation:")
    print("   See scripts/TRANSLATION_README.md for detailed guide")
    print("\n")

if __name__ == "__main__":
    main()
