# ResQ AI: Roadmap

**Version:** v1.0 (Full-Stack Production Launch)
**Granularity:** Standard (5-8 phases, 3-5 plans each)
**Stack:** React 18 + Vite, Tailwind CSS v3, Leaflet + OSM, Supabase + PostGIS, FastAPI + Docker, Vercel, Twilio

---

## Phase 1: Foundation — Supabase + Infrastructure Setup

**Goal:** Production-ready backend foundation with spatial database, auth, realtime, storage, and git/CI/CD pipeline in place.

**Plans:**
1. **1.1 — Supabase Project Init via MCP** — Create Supabase project, enable PostGIS extension, configure Auth (OTP + magic link), Storage bucket, Realtime channels
2. **1.2 — Database Schema** — Create all tables with PostGIS geometry columns, GIST indexes, and RLS policies: profiles, disaster_events, user_reports, sos_requests, safe_zones, notifications, volunteers
3. **1.3 — Seed Data** — Seed safe_zones (hospitals, shelters, rescue stations for major Indian cities), sample disaster_events, sample user_reports for dev testing
4. **1.4 — Vercel CI/CD + Repo** — Connect GitHub repo to Vercel, configure environment variables, set up preview deployments

**Requirements covered:** INFRA-01 to INFRA-08, partially DATA-06

---

## Phase 2: Frontend Foundation + Auth

**Goal:** React app scaffolded with routing, design system, auth flows, i18n, and PWA manifest.

**Plans:**
1. **2.1 — Vite + React + Tailwind Scaffold** — Initialize Vite project, install Tailwind v3, configure fonts (Inter), routing (React Router v6), Zustand store, React Hook Form + Zod
2. **2.2 — Design System + Layout** — Create global CSS design tokens (colors from prompt spec), header/nav component, footer, responsive layout, emergency-optimized UX (large touch targets, high contrast)
3. **2.3 — Auth Pages** — Sign-up/sign-in with Supabase (phone OTP + magic link), profile setup page, anonymous browsing (no forced login for alerts/map)
4. **2.4 — i18n + PWA** — i18next setup (EN/HI/Hinglish), language switcher in header, `vite-plugin-pwa` with manifest, service worker skeleton

**Requirements covered:** FE-01 to FE-06, AUTH-01 to AUTH-05

---

## Phase 3: Live Disaster Map + Safe Zones

**Goal:** The core interactive map of India fully functional with all marker types, popups, layers, legend, and safe zone directory.

**Plans:**
1. **3.1 — Base Map Setup** — Leaflet + OSM with India center, install plugins (markercluster, heat, leaflet-geoman, routing machine), zoom controls, responsive height
2. **3.2 — Disaster Markers + Layers** — Color-coded risk zone rendering (Red/Orange/Yellow/Green), marker icons by disaster type (flood, earthquake, landslide, rainfall, tsunami, wildfire), Supabase Realtime subscription for live updates
3. **3.3 — Safe Zone Overlays + Popups** — Blue safe zone markers (hospital/shelter/rescue/camp) with full detail popup panels (capacity, contacts, directions), historical data layer (gray, toggleable), user-report markers (purple)
4. **3.4 — Map UI** — Legend panel, layer control, "Locate Me" button (browser geolocation), alert ticker, map legend, heatmap toggle, admin zone drawing (Leaflet-Geoman)

**Requirements covered:** MAP-01 to MAP-12, SAFE-01 to SAFE-06

---

## Phase 4: Data Ingestion + Real-Time Alert Pipeline

**Goal:** All external disaster data sources integrated with auto-ingestion, normalization, caching, and the map auto-updating in real-time.

**Plans:**
1. **4.1 — USGS Earthquake Poller** — Supabase Edge Function polling USGS GeoJSON every 5 min, normalizing to disaster_events schema, spatial deduplication
2. **4.2 — Weather Pollers (IMD + OWM)** — OpenWeatherMap API (current + forecast), IMD RSS feed parser, INCOIS tsunami bulletin parser, NASA FIRMS fire data — all normalized + cached with Stale-While-Revalidate
3. **4.3 — Multi-Source Fallback + Frontend Integration** — Priority fallback chain (IMD → OWM → cache), data freshness badges on UI, alert ticker pulling from disaster_events, Realtime subscription triggers map updates

**Requirements covered:** DATA-01 to DATA-07, MAP-12

---

## Phase 5: Notifications System

**Goal:** Multi-channel disaster notifications (WhatsApp, SMS, Web Push) with spatial targeting, user preferences, and async queuing.

**Plans:**
1. **5.1 — Twilio Integration** — WhatsApp Business API setup, SMS fallback, pre-register Utility message templates with Meta, async notification queue with exponential backoff
2. **5.2 — Spatial Targeting** — `ST_DWithin` query to find users in affected radius, notification trigger on new disaster_events, test with seeded user data
3. **5.3 — Web Push + User Preferences** — Web Push API with service worker, notification subscription UI, user preferences panel (opt-in per disaster type per area), notification log in Supabase

**Requirements covered:** NOTIF-01 to NOTIF-06, partially FE-06

---

## Phase 6: Citizen Reporting + Admin Dashboard

**Goal:** Full citizen incident reporting pipeline with media upload, community verification, and admin review tools.

**Plans:**
1. **6.1 — Report Submission** — Incident report form (type, description, GPS, photo/video upload to Supabase Storage), IP rate limiting, spam flagging
2. **6.2 — Verification Pipeline** — Community verify/dispute buttons, auto status upgrade (purple → orange at 5 confirms, orange → red with admin approval), location fuzzing (100m radius on public map), reputation score system
3. **6.3 — Admin Dashboard** — Admin-only route + RLS, report review queue, disaster declaration tool, safe zone management CRUD, notification broadcast panel, Leaflet-Geoman zone drawing for affected area designation

**Requirements covered:** REPORT-01 to REPORT-07, ADMIN-01 to ADMIN-06

---

## Phase 7: SOS System + Volunteer Coordination

**Goal:** One-tap SOS with auto GPS, responder dispatch, volunteer profiles, and real-time rescue tracking.

**Plans:**
1. **7.1 — SOS Button + Submission** — Floating SOS button on all pages, SOS form (emergency type, family size, medical, floor), continuous GPS pinging, Mark Safe/Resolved flows
2. **7.2 — Responder Dispatch** — Notify NDRF + verified volunteers within 10km via Supabase Realtime + Twilio, SOS markers on responder map (pulsing animation), rescue team ETA tracker, PII protection via RLS
3. **7.3 — Volunteer System** — Registration + skill/resource profile, admin verification workflow, real-time availability status, mission history + star rating, dispatch assignment, Volunteer profile popup on map

**Requirements covered:** SOS-01 to SOS-08, VOL-01 to VOL-05

---

## Phase 8: AI/ML Predictions + PWA Optimization

**Goal:** FastAPI ML microservice deployed with flood prediction + rainfall forecasting integrated into the map. PWA fully offline-optimized.

**Plans:**
1. **8.1 — FastAPI ML Service** — Python 3.12 + Docker, XGBoost flood classifier (trained on IMD historical rainfall + USGS terrain), Prophet rainfall forecasting, REST API endpoints, Railway deployment
2. **8.2 — AI Predictions on Map** — Prediction overlays on map with confidence %, AI prediction badges (dashed borders, distinct styling from official data), data source labeling (AI vs. Official vs. Historical)
3. **8.3 — PWA Offline Optimization** — Workbox service worker with aggressive caching strategy (5 min TTL for evacuation data), IndexedDB for incident map data, background sync for queued reports, force update on new alert push, battery saver mode (low-power UI trigger)

**Requirements covered:** ML-01 to ML-06, FE-05 (PWA complete), REPORT offline sync

---

## Backlog (v2 Consideration)

- Phase 9: WhatsApp Bot (bidirectional reporting via chat)
- Phase 10: Offline district map download (vector tiles per district)
- Phase 11: Google Flood Hub + satellite imagery integration
- Phase 12: IVR/USSD missed-call SOS for non-smartphone users
- Phase 13: Multi-language expansion (Tamil, Marathi, Bengali, Telugu)
- Phase 14: Government authority portal (SDMA/district collector role)

---

*Roadmap created: 2026-03-22*
*8 phases — Standard granularity — Parallel execution enabled*
