# Phase 2 Research: Frontend Foundation + Auth

This phase focuses on scaffolding the React application with a premium look and feel, robust auth, and offline capabilities.

## Tech Stack & Configuration

- **Vite & React 18**: ESM-first builds, Fast Refresh.
- **Tailwind CSS v3**: Utility-first styling with custom ResQ AI brand tokens.
- **React Router v6**: Client-side routing with protected routes.
- **Zustand**: Lightweight state management for auth and map state.
- **i18next**: Internationalization (English, Hindi, Hinglish).
- **Vite PWA Plugin**: Service worker and manifest for offline and mobile install.

## Brand Tokens (from spec)

- **Colors**:
  - `brand-red`: `#E63946` (Active Disaster/Emergency)
  - `brand-orange`: `#F4A261` (High Risk/Warning)
  - `brand-yellow`: `#E9C46A` (Medium Risk/Alert)
  - `brand-green`: `#2A9D8F` (Safe Zone)
  - `brand-blue`: `#457B9D` (Infrastructure/Relief)
  - `brand-dark`: `#1D3557` (Primary Text/Nav)
  - `brand-light`: `#F1FAEE` (Background Surface)

## Auth Flows

- **Supabase Phone OTP**: Primary for rural/fast access.
- **Supabase Magic Link**: Secondary for email users.
- **Anonymous Browsing**: Allow map viewing without login; force Auth for SOS/Reporting.

## PWA Strategy

- **Manifest**: `theme_color: #E63946`, `background_color: #F1FAEE`.
- **Icons**: Emergency Red icon with white cross/logo.
- **Offline**: Cache map tiles and incident data for 5 minutes.
