---
plan: 02-i18n-pwa
phase: 2
wave: 2
depends_on: [02-design-system]
files_modified:
  - src/i18n/config.ts
  - src/i18n/locales/en.json
  - src/i18n/locales/hi.json
  - vite.config.ts
  - public/manifest.json
requirements_addressed:
  - FE-04
  - FE-05
  - FE-06
autonomous: true
---

# Plan 2.4: i18n + PWA

Add support for English, Hindi, and Hinglish, and configure the PWA manifest and service worker.

## read_first
- `.planning/phases/02-frontend-foundation-auth/02-RESEARCH.md` — Localization and PWA strategy.

## Tasks
1. `npm install i18next react-i18next i18next-browser-languagedetector`
2. Configure `src/i18n/config.ts` with standard language resources for `en`, `hi`, and `hinglish`.
3. Build a `LanguageSwitcher.tsx` component and add it to the Header.
4. `npm install -D vite-plugin-pwa`
5. Configure `vite-plugin-pwa` in `vite.config.ts` with manifest and workbox caching rules.
6. Verify manifest and service worker in browser dev tools.
