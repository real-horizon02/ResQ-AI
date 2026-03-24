# ResQ AI

## What This Is

ResQ AI is a production-ready, AI-powered disaster prediction and response platform for India. It serves Indian citizens (urban and rural), government authorities, NGOs, and volunteers with early disaster warnings, real-time alerts, live interactive maps, citizen incident reporting, SOS/rescue coordination, and community-driven verification. The platform is built for full accessibility — supporting English, Hindi, and Hinglish — and is deployable as a Progressive Web App (PWA).

## Core Value

Lives saved through early AI-driven warnings and fast, frictionless access to emergency help and safe zones — before and during a disaster.

## Requirements

### Validated

- [x] Supabase backend: PostgreSQL with PostGIS, JWT auth (OTP + magic link), Realtime subscriptions, Row Level Security, Storage (Validated in Phase 1)
- [x] PostGIS: Supabase PostGIS extension active for spatial queries (Validated in Phase 1)
- [x] Frontend Scaffold: React 18 + Vite + Tailwind CSS v3 with premium glassmorphism design (Validated in Phase 2)
- [x] Auth Flows: Phone OTP + Magic Link integrated with Supabase (Validated in Phase 2)
- [x] i18n: English, Hindi, and Hinglish support with real-time toggle (Validated in Phase 2)
- [x] PWA: Offline manifest and service worker registration (Validated in Phase 2)
- [x] Vercel deployment with CI/CD (Config documented in Phase 1)
- [x] Safe zone directory (tables and seed data in Phase 1)

### Active

- [ ] Interactive live map of India with disaster risk zones (Leaflet + OpenStreetMap)
- [ ] AI/ML disaster prediction engine (flood, landslide, earthquake, heavy rainfall, tsunami, cyclone)
- [ ] Color-coded risk system: Red (active), Orange (80–100%), Yellow (50–79%), Green (<50%), Blue (safe zones), Purple (user reports), Gray (historical)
- [ ] Real-time alerts via WhatsApp (Twilio), SMS fallback, email, and push notifications (PWA)
- [ ] Live data integration: USGS Earthquake API, OpenWeatherMap API, IMD RSS feeds, NDMA bulletins, INCOIS (tsunami), NASA FIRMS (wildfire)
- [ ] Citizen incident reporting with photo/video upload and community verification system (purple → orange → red pipeline)
- [ ] SOS emergency button — auto-shares GPS location with NDRF, volunteers, authorities
- [ ] Safe zone directory with live capacity data: hospitals, shelters, relief camps, rescue stations
- [ ] Evacuation route calculator using Leaflet routing
- [ ] Supabase backend: PostgreSQL with PostGIS, JWT auth (OTP + magic link), Realtime subscriptions, Row Level Security, Storage
- [ ] FastAPI AI/ML microservice (Docker): flood/landslide prediction models, ARIMA time-series, geospatial processing
- [ ] Multi-language support: English, Hindi, Hinglish (i18next)
- [ ] Voice input/output using Web Speech API
- [ ] Admin dashboard: zone management, report verification, disaster declaration, user management
- [ ] Volunteer onboarding, verification, and real-time dispatch system
- [ ] Government authority dashboard: issue official warnings, manage shelters, track resources
- [ ] Historical disaster database with lessons-learned reports
- [ ] Donation and supply coordination for relief camps
- [ ] Full PWA with offline capability and web push notifications
- [ ] Vercel deployment with CI/CD

### Out of Scope

- Native iOS / Android mobile apps — Web PWA first; mobile app in future milestone
- Real-time video streaming from disaster zones — too bandwidth-heavy for rural users in v1
- Peer-to-peer encrypted chat — Socket.io group chat deferred to v2
- Payment processing — donation flows will link to external platforms in v1
- AI-generated imagery / deepfake detection for incident reports — v2 roadmap

## Context

- **Target geography**: All of India (28 states + 8 UTs), with special focus on flood-prone (Bihar, Assam, Kerala), cyclone-prone (Odisha, AP, TN), and landslide-prone (Uttarakhand, HP, NE states) regions
- **Data sources priority**: OFFICIAL_WARNING (IMD/NDMA/INCOIS) > REAL_API_DATA (USGS/OWM) > AI_PREDICTION > HISTORICAL_DATA > SIMULATED
- **Accessibility first**: Screen reader support, large touch targets, low-bandwidth mode for rural users
- **Map stack**: Leaflet.js + OpenStreetMap tiles (primary, free), with Leaflet Draw for admin zone marking
- **Backend**: Supabase (PostgreSQL + PostGIS, auth, realtime, storage) — to be set up via MCP
- **AI/ML service**: FastAPI Python microservice containerized with Docker
- **Frontend**: React 18 + Vite + Tailwind CSS v3 + Framer Motion
- **Hosting**: Vercel (frontend + serverless edge functions), Docker container for AI service

## Constraints

- **Tech Stack**: React 18 + Vite, Tailwind CSS v3, Leaflet + OpenStreetMap (no Mapbox cost), Supabase, FastAPI/Python, Vercel — locked for v1
- **Budget**: Free-tier APIs where possible (USGS = free, OWM free tier 1000 calls/day, Supabase free tier)
- **Twilio**: WhatsApp + SMS notifications require Twilio account and verified sender number
- **PostGIS**: Supabase PostGIS extension needed for spatial queries (safe zone proximity, affected radius)
- **Performance**: All alerts must fire within 2 minutes of trigger; map must load under 3s on 4G

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Leaflet + OpenStreetMap over Mapbox | No API key cost, open-source, good Leaflet ecosystem | — Pending |
| Supabase over custom backend | Auth + DB + Realtime + Storage in one BaaS, faster shipping | — Pending |
| FastAPI Python AI microservice | Python ML ecosystem (scikit-learn, XGBoost, Prophet) is unmatched | — Pending |
| React 18 + Vite over CRA | Faster builds, native ESM, better DX | — Pending |
| Twilio as primary notification channel | Most reliable WhatsApp Business API provider in India | — Pending |
| Full-stack v1 (not frontend-first) | User wants production-ready deployment from day one | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
