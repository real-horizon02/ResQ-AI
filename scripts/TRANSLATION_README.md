# ResQ AI Website Translation System

## 🌍 Overview

This translation system enables your ResQ AI platform to support multiple languages:
- **English (en)** - Default language
- **Hindi (hi)** - Devanagari script for Indian users
- **Hinglish (hinglish)** - Roman script Hindi for ease of reading

## 📋 Quick Start

### 1. Generate Translations

```bash
# From project root
python scripts/run_translation.py
```

This generates:
- i18n configuration files
- Translation JSON files for all languages
- Updated i18n setup

### 2. Update main.tsx

Add i18n import at the top of `src/main.tsx`:

```typescript
import './i18n/config'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 3. Use Translations in Components

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <h1>{t('common.app_name')}</h1>
      <button onClick={() => i18n.changeLanguage('hi')}>
        हिंदी
      </button>
    </div>
  )
}
```

## 📁 File Structure

```
src/
├── i18n/
│   ├── config.ts                          # Main i18n configuration
│   └── locales/
│       ├── en/translation.json            # English translations
│       ├── hi/translation.json            # Hindi translations
│       └── hinglish/translation.json      # Hinglish translations
```

## 🔧 Python Scripts

### `generate_i18n.py`
Generates i18n configuration and base translation files.

```bash
python scripts/generate_i18n.py
```

### `translate_app.py`
Scans your codebase for translatable strings and generates translation files.

**Features:**
- Extracts strings from React/TypeScript files
- Supports custom translation mappings
- Integrates with Google Translate API (optional)
- Falls back to offline translations

**Usage:**
```bash
python scripts/translate_app.py --extract-only
python scripts/translate_app.py --output-dir ./src/i18n/locales
```

### `run_translation.py`
Master orchestrator that runs the entire translation workflow.

```bash
python scripts/run_translation.py
```

## 🎯 Translation Keys Structure

Translations are organized hierarchically:

```json
{
  "common": {
    "app_name": "ResQ AI",
    "sos": "SOS EMERGENCY"
  },
  "nav": {
    "map": "Disaster Map",
    "volunteer": "Volunteer"
  },
  "home": {
    "hero_label": "INDIA'S EMERGENCY RESPONSE PLATFORM"
  }
}
```

Usage in components:
```typescript
t('common.app_name')      // ResQ AI
t('nav.map')              // Disaster Map
t('home.hero_label')      // INDIA'S EMERGENCY RESPONSE PLATFORM
```

## 🌐 Language Switcher Component

Create a language switcher in your Navbar or Header:

```typescript
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="language-switcher">
      <button 
        onClick={() => i18n.changeLanguage('en')}
        className={i18n.language === 'en' ? 'active' : ''}
      >
        English
      </button>
      <button 
        onClick={() => i18n.changeLanguage('hi')}
        className={i18n.language === 'hi' ? 'active' : ''}
      >
        हिंदी
      </button>
      <button 
        onClick={() => i18n.changeLanguage('hinglish')}
        className={i18n.language === 'hinglish' ? 'active' : ''}
      >
        Hinglish
      </button>
    </div>
  )
}
```

## 📝 Adding New Translations

1. **Edit the JSON files directly:**

```json
{
  "new_section": {
    "new_key": "New English Text",
    "another_key": "Another Text"
  }
}
```

2. **Or use Python to add translations programmatically:**

```python
from translate_app import WebsiteTranslator

translator = WebsiteTranslator()
# Add custom translations
translator.translations['en']['new_key'] = 'English'
translator.translations['hi']['new_key'] = 'हिंदी'
translator.translations['hinglish']['new_key'] = 'Hinglish'
```

## 🔗 Integration with Components

### Example: Navigation Component

```typescript
import { useTranslation } from 'react-i18next'

export function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="navbar">
      <div className="nav-links">
        <a href="/">{t('nav.home')}</a>
        <a href="/map">{t('nav.map')}</a>
        <a href="/volunteer">{t('nav.volunteer')}</a>
        <a href="/safe-zones">{t('nav.safe_zones')}</a>
      </div>
      <button className="sos-button">
        {t('common.sos')}
      </button>
    </nav>
  )
}
```

### Example: Home Page

```typescript
import { useTranslation } from 'react-i18next'

export function Home() {
  const { t } = useTranslation()

  return (
    <div className="hero">
      <h1>{t('home.hero_label')}</h1>
      <p>
        <span>{t('home.hero_when')}</span>
        <span>{t('home.hero_seconds')}</span>
        <span>{t('home.hero_matter')}</span>
        <span>{t('home.hero_data')}</span>
        <span>{t('home.hero_saves')}</span>
      </p>
      <p>{t('home.hero_subtitle')}</p>
      <button>{t('home.cta_sos')}</button>
      <button>{t('home.cta_map')}</button>
    </div>
  )
}
```

## 🚀 Advanced Features

### Pluralization

```json
{
  "items": {
    "one": "One item",
    "other": "{{count}} items"
  }
}
```

Usage:
```typescript
t('items', { count: 5 })  // "5 items"
t('items', { count: 1 })  // "One item"
```

### Variable Interpolation

```json
{
  "greeting": "Hello {{name}}, welcome to {{app_name}}"
}
```

Usage:
```typescript
t('greeting', { name: 'John', app_name: 'ResQ AI' })
// "Hello John, welcome to ResQ AI"
```

### Nested Translations

```json
{
  "errors": {
    "404": "Page not found",
    "500": "Server error",
    "network": "Network error"
  }
}
```

Usage:
```typescript
t('errors.404')
t('errors.500')
```

## 🔄 Updating Translations

### Update English Translations
Edit `src/i18n/locales/en/translation.json`

### Update Hindi Translations
Edit `src/i18n/locales/hi/translation.json`

### Update Hinglish Translations
Edit `src/i18n/locales/hinglish/translation.json`

### Regenerate from Source
```bash
python scripts/translate_app.py
```

## 🧪 Testing Translations

1. Start dev server:
```bash
npm run dev
```

2. Open browser console:
```javascript
// Get current language
i18next.language

// Change language
i18next.changeLanguage('hi')
i18next.changeLanguage('hinglish')
i18next.changeLanguage('en')

// Get translation
i18next.t('common.app_name')
```

3. Test in UI:
   - Switch language using language switcher
   - Check all pages display correct language
   - Verify text formatting and readability

## 🐛 Troubleshooting

### Translations not showing
```typescript
// Check if i18n is initialized
console.log(i18n.isInitialized)

// Check language
console.log(i18n.language)

// Check translation exists
console.log(i18n.t('key'))
```

### Missing translations
```typescript
// Enable debug mode
// In src/i18n/config.ts, set debug: true
```

### Language not persisting
The system uses localStorage by default. Check:
```javascript
localStorage.getItem('i18nextLng')
```

## 📚 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [Translation Keys Best Practices](https://www.i18next.com/translation-function/essentials)

## 🤝 Contributing Translations

To add or improve translations:

1. Edit the JSON files in `src/i18n/locales/`
2. Test thoroughly
3. Commit changes
4. Create a PR

## 📧 Support

For issues or questions about the translation system:
1. Check the troubleshooting section
2. Review the sample components
3. Check browser console for errors
4. Create an issue on GitHub

---

**Happy Translating! 🌍**

Your ResQ AI platform is now ready to serve users in English, Hindi, and Hinglish!
