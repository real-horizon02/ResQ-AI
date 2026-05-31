# Translation Integration Guide

## Quick Reference: Using Translations in ResQ AI Components

This guide shows how to implement translations across all pages and components of your ResQ AI website.

---

## 1. Import the Translation Hook

In any React component where you need translations:

```typescript
import { useTranslation } from 'react-i18next'
```

## 2. Use in Component

```typescript
export function MyComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.app_name')}</h1>
    </div>
  )
}
```

---

## 📱 Component Examples

### Navbar/Header Component

```typescript
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcherDropdown'

export function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="navbar">
      <div className="logo">{t('common.app_name')}</div>
      <div className="nav-links">
        <a href="/">{t('nav.home')}</a>
        <a href="/map">{t('nav.map')}</a>
        <a href="/volunteer">{t('nav.volunteer')}</a>
        <a href="/safe-zones">{t('nav.safe_zones')}</a>
      </div>
      <div className="nav-right">
        <button className="sos-btn">{t('common.sos')}</button>
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
```

### Home Page

```typescript
import { useTranslation } from 'react-i18next'

export function Home() {
  const { t } = useTranslation()

  return (
    <div className="hero">
      <h1 className="hero-label">
        {t('home.hero_label')}
      </h1>
      <p className="hero-tagline">
        {t('home.hero_subtitle')}
      </p>
      <p className="hero-flow">
        <span>{t('home.hero_when')}</span>
        <span className="highlight">{t('home.hero_seconds')}</span>
        <span>{t('home.hero_matter')}</span>
        <span className="highlight">{t('home.hero_data')}</span>
        <span>{t('home.hero_saves')}</span>
      </p>
      <div className="cta-buttons">
        <button className="btn-sos">
          {t('home.cta_sos')}
        </button>
        <button className="btn-map">
          {t('home.cta_map')}
        </button>
      </div>
    </div>
  )
}
```

### Map Page

```typescript
import { useTranslation } from 'react-i18next'

export function Map() {
  const { t } = useTranslation()

  return (
    <div className="map-container">
      <h1>{t('map.title')}</h1>
      <div className="map-controls">
        <button>{t('map.zoom_in')}</button>
        <button>{t('map.zoom_out')}</button>
        <select>
          <option>{t('map.filter_by')}</option>
          <option>{t('map.high')}</option>
          <option>{t('map.medium')}</option>
          <option>{t('map.low')}</option>
        </select>
      </div>
      <div className="incidents-list">
        <h3>{t('map.active_incidents')}</h3>
        {/* Map and incidents here */}
      </div>
    </div>
  )
}
```

### Volunteer Dashboard

```typescript
import { useTranslation } from 'react-i18next'

export function VolunteerDashboard() {
  const { t } = useTranslation()

  return (
    <div className="volunteer-dashboard">
      <h1>{t('volunteer.title')}</h1>
      <div className="task-sections">
        <section>
          <h2>{t('volunteer.available_tasks')}</h2>
          {/* Available tasks */}
        </section>
        <section>
          <h2>{t('volunteer.my_tasks')}</h2>
          {/* My tasks */}
        </section>
        <section>
          <h2>{t('volunteer.completed_tasks')}</h2>
          {/* Completed tasks */}
        </section>
      </div>
    </div>
  )
}
```

### SOS Report Page

```typescript
import { useTranslation } from 'react-i18next'

export function SOS() {
  const { t } = useTranslation()

  return (
    <div className="sos-page">
      <h1>{t('sos.title')}</h1>
      <form className="sos-form">
        <div className="form-group">
          <label>{t('sos.describe_situation')}</label>
          <textarea placeholder={t('sos.emergency_message')} />
        </div>
        <div className="form-group">
          <label>{t('sos.select_location')}</label>
          <input type="text" />
        </div>
        <div className="form-group">
          <label>{t('sos.attach_media')}</label>
          <input type="file" />
        </div>
        <button type="submit">{t('sos.submit_report')}</button>
      </form>
    </div>
  )
}
```

### Admin Dashboard

```typescript
import { useTranslation } from 'react-i18next'

export function AdminDashboard() {
  const { t } = useTranslation()

  return (
    <div className="admin-dashboard">
      <h1>{t('admin.title')}</h1>
      <div className="statistics">
        <div className="stat-card">
          <p>{t('admin.total_incidents')}</p>
          <h3>42</h3>
        </div>
        <div className="stat-card">
          <p>{t('admin.active_volunteers')}</p>
          <h3>28</h3>
        </div>
        <div className="stat-card">
          <p>{t('admin.response_time')}</p>
          <h3>2.5 mins</h3>
        </div>
      </div>
      <section>
        <h2>{t('admin.incidents')}</h2>
        {/* Incident list */}
      </section>
    </div>
  )
}
```

### Profile Page

```typescript
import { useTranslation } from 'react-i18next'

export function Profile() {
  const { t } = useTranslation()

  return (
    <div className="profile-page">
      <h1>{t('profile.title')}</h1>
      <form className="profile-form">
        <div className="form-group">
          <label>{t('profile.name')}</label>
          <input type="text" />
        </div>
        <div className="form-group">
          <label>{t('profile.email')}</label>
          <input type="email" />
        </div>
        <div className="form-group">
          <label>{t('profile.phone')}</label>
          <input type="tel" />
        </div>
        <div className="form-group">
          <label>{t('profile.location')}</label>
          <input type="text" />
        </div>
        <div className="form-group">
          <label>{t('profile.language')}</label>
          <select>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
        <button type="submit">{t('common_actions.save')}</button>
        <button type="reset">{t('common_actions.cancel')}</button>
      </form>
    </div>
  )
}
```

### Login/Auth Page

```typescript
import { useTranslation } from 'react-i18next'

export function Login() {
  const { t } = useTranslation()

  return (
    <div className="login-page">
      <h1>{t('auth.login')}</h1>
      <form>
        <div className="form-group">
          <label>{t('auth.email')}</label>
          <input type="email" />
        </div>
        <div className="form-group">
          <label>{t('auth.password')}</label>
          <input type="password" />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" />
            {t('auth.remember_me')}
          </label>
        </div>
        <button type="submit">{t('auth.login')}</button>
        <a href="/forgot">{t('auth.forgot_password')}</a>
      </form>
      <p>
        {t('auth.dont_have_account')} 
        <a href="/signup">{t('auth.signup')}</a>
      </p>
    </div>
  )
}
```

---

## 🎨 Dynamic Content with Pluralization

```typescript
// In translation JSON
{
  "task_count": {
    "one": "You have 1 task",
    "other": "You have {{count}} tasks"
  }
}

// In component
const { t } = useTranslation()
t('task_count', { count: 5 })  // "You have 5 tasks"
t('task_count', { count: 1 })  // "You have 1 task"
```

---

## 🔄 Language Switching

### Manual Language Switch

```typescript
const { i18n } = useTranslation()

// Switch to Hindi
i18n.changeLanguage('hi')

// Switch to Hinglish
i18n.changeLanguage('hinglish')

// Switch to English
i18n.changeLanguage('en')

// Get current language
console.log(i18n.language)
```

### Using Language Switcher Component

Import and use the pre-built language switcher:

```typescript
import { LanguageSwitcher } from './components/ui/LanguageSwitcherDropdown'

export function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  )
}
```

---

## 📚 Translation Keys Reference

### Common Keys
```
common.app_name
common.sos
common.get_help
common.sign_in
common.volunteer
common.language
common.select_language
```

### Navigation Keys
```
nav.home
nav.map
nav.volunteer
nav.safe_zones
nav.reports
nav.admin
```

### Header Keys
```
header.dashboard
header.liveMap
header.report
header.profile
header.signIn
header.commandCenter
header.myTasks
header.logout
```

### Home Page Keys
```
home.hero_label
home.hero_when
home.hero_seconds
home.hero_matter
home.hero_data
home.hero_saves
home.hero_subtitle
home.hero_tagline
home.cta_sos
home.cta_map
```

### Common Actions
```
common_actions.save
common_actions.cancel
common_actions.delete
common_actions.edit
common_actions.close
common_actions.submit
```

---

## ✅ Testing Translations

1. **In Browser DevTools:**
```javascript
i18next.changeLanguage('hi')
```

2. **Check if translation loads:**
```javascript
i18next.t('common.app_name')
```

3. **Verify in localStorage:**
```javascript
localStorage.getItem('i18nextLng')
```

---

## 🚀 Deployment

When deploying:

1. All translation files are included in build
2. Language preference is saved in localStorage
3. Users will see their preferred language on next visit
4. Fallback to English if language not available

---

## 💡 Best Practices

1. **Use nested keys** for organization
2. **Keep translations organized** by page/component
3. **Add translations early** in development
4. **Test all languages** before deployment
5. **Use consistent naming** for similar concepts
6. **Include context** for translators (comments)

---

## 📞 Support

For questions or issues:
1. Check TRANSLATION_README.md
2. Review component examples above
3. Test in browser console
4. Check translation files in `src/i18n/locales/`

Happy translating! 🌍
