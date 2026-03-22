# Requirements: ResQ AI

**Defined:** 2026-03-22
**Core Value:** Lives saved through AI-driven early warnings and frictionless emergency access — before and during a disaster.

## v1 Requirements

### Infrastructure & Backend

- [ ] **INFRA-01**: Supabase project initialized with PostgreSQL + PostGIS extension enabled
- [ ] **INFRA-02**: Database schema: profiles, disaster_events, user_reports, sos_requests, safe_zones, notifications, volunteers tables with spatial geometry columns
- [ ] **INFRA-03**: Supabase Auth configured (OTP phone + magic link email)
- [ ] **INFRA-04**: Supabase Storage configured for incident media uploads
- [ ] **INFRA-05**: Row Level Security (RLS) policies for all tables
- [ ] **INFRA-06**: Supabase Connection Pooling (PgBouncer) enabled
- [ ] **INFRA-07**: Supabase Realtime configured for disaster_events, user_reports, sos_requests channels
- [ ] **INFRA-08**: Git repository initialized; Vercel project connected for CI/CD

### Frontend Foundation

- [ ] **FE-01**: React 18 + Vite project scaffolded with Tailwind CSS v3
- [ ] **FE-02**: Routing configured (React Router v6): Home, Map, Alerts, Report, SOS, Admin, Auth pages
- [ ] **FE-03**: i18next configured for English, Hindi, Hinglish switching
- [ ] **FE-04**: Zustand store for global state (user, alerts, map, notifications)
- [ ] **FE-05**: PWA manifest + service worker via `vite-plugin-pwa`
- [ ] **FE-06**: Mobile-responsive layout with emergency-optimized UX (large touch targets, high contrast)

### Live Disaster Map

- [ ] **MAP-01**: Leaflet.js + OpenStreetMap base map of India
- [ ] **MAP-02**: Color-coded risk zone overlays (Red/Orange/Yellow/Green/Blue/Purple/Gray system)
- [ ] **MAP-03**: `Leaflet.markercluster` for disaster incident markers
- [ ] **MAP-04**: `leaflet.heat` heatmap layer for rainfall intensity
- [ ] **MAP-05**: Safe zone markers (hospitals, shelters, rescue stations, relief camps) with detail popups
- [ ] **MAP-06**: User-report markers (purple, unverified) with verification count display
- [ ] **MAP-07**: Historical disaster data layer (gray, toggleable)
- [ ] **MAP-08**: Map legend panel (always visible)
- [ ] **MAP-09**: `Leaflet Routing Machine` for evacuation route calculation
- [ ] **MAP-10**: Admin zone drawing tool via `Leaflet-Geoman`
- [ ] **MAP-11**: User geolocation auto-detect ("Locate Me")
- [ ] **MAP-12**: Realtime map updates via Supabase Realtime subscription

### Data Ingestion & Live Alerts

- [ ] **DATA-01**: USGS Earthquake API poller (GeoJSON, every 5 min, caching)
- [ ] **DATA-02**: OpenWeatherMap API poller (current + forecast, every 15 min)
- [ ] **DATA-03**: IMD RSS feed parser (rainfall warnings, every 30 min)
- [ ] **DATA-04**: NASA FIRMS fire data integration (every 60 min)
- [ ] **DATA-05**: Multi-source fallback chain (IMD → OWM → cached data)
- [ ] **DATA-06**: Adapter/normalizer pattern: all sources → unified internal disaster_events schema
- [ ] **DATA-07**: Alert ticker on homepage (live scrolling banner)

### Notifications

- [ ] **NOTIF-01**: Twilio WhatsApp Business API integration for location-targeted alerts
- [ ] **NOTIF-02**: Twilio SMS fallback for users without smartphones
- [ ] **NOTIF-03**: Web Push API + service worker for PWA push notifications
- [ ] **NOTIF-04**: Spatial notification targeting: `ST_DWithin` to find users in affected radius
- [ ] **NOTIF-05**: Async notification queue with exponential backoff (prevent Twilio rate limit errors)
- [ ] **NOTIF-06**: User notification preferences (opt-in/out per disaster type per area)

### Citizen Reporting

- [ ] **REPORT-01**: Incident report form with type, description, photos/video upload (Supabase Storage)
- [ ] **REPORT-02**: GPS auto-capture for all reports
- [ ] **REPORT-03**: Community verify/dispute buttons with confirmation count display
- [ ] **REPORT-04**: Report status pipeline: Unverified (purple) → Community Verified (orange) → Admin Verified (red)
- [ ] **REPORT-05**: Anti-spam: IP rate limiting + user reputation score gates
- [ ] **REPORT-06**: "Report as spam" flagging mechanism
- [ ] **REPORT-07**: Location fuzzing on public map (100m radius, not exact coordinates)

### SOS & Emergency Response

- [ ] **SOS-01**: Floating SOS button (always visible on all pages)
- [ ] **SOS-02**: SOS form: emergency type, family size, medical status, floor level
- [ ] **SOS-03**: Auto-GPS capture and continuous location pinging for active SOS
- [ ] **SOS-04**: Notify NDRF + verified volunteers within 10km via Supabase Realtime + Twilio
- [ ] **SOS-05**: SOS markers on admin/responder map with pulsing animation
- [ ] **SOS-06**: Rescue team ETA tracking display (real-time progress bar)
- [ ] **SOS-07**: "Mark as Resolved" for responders + "Mark Safe" for family
- [ ] **SOS-08**: PII protection: phone masked on public map; full data only for verified responders (RLS)

### Safe Zones Directory

- [ ] **SAFE-01**: Hospital listings with live bed capacity data and emergency contact
- [ ] **SAFE-02**: Relief shelter listings with current occupancy, amenities, registration info
- [ ] **SAFE-03**: Rescue station listings with personnel/equipment status
- [ ] **SAFE-04**: Relief camp listings with resource stock levels and volunteer needs
- [ ] **SAFE-05**: Nearest safe zones query using `ST_DWithin` with distance + estimated time
- [ ] **SAFE-06**: "Get Directions" via Leaflet Routing Machine

### User Authentication & Profiles

- [ ] **AUTH-01**: Phone OTP sign-up/sign-in
- [ ] **AUTH-02**: Email magic link sign-in
- [ ] **AUTH-03**: User profile: name, location preferences, notification settings
- [ ] **AUTH-04**: Session persistence across browser refresh
- [ ] **AUTH-05**: Anonymous browsing allowed for alerts/map (no forced sign-in)

### AI/ML Predictions

- [ ] **ML-01**: FastAPI microservice scaffolded (Python 3.12 + Docker)
- [ ] **ML-02**: Flood probability prediction model (XGBoost, trained on rainfall/terrain/historical data)
- [ ] **ML-03**: Rainfall time-series forecasting (Prophet)
- [ ] **ML-04**: AI prediction overlays on map (confidence % + color coded)
- [ ] **ML-05**: Data disclaimer: clearly labeled AI predictions vs. official data vs. simulated
- [ ] **ML-06**: FastAPI deployed to Railway/Render

### Admin Dashboard

- [ ] **ADMIN-01**: Admin-only route + Supabase role-based access
- [ ] **ADMIN-02**: Disaster declaration tool (create/update/close official events)
- [ ] **ADMIN-03**: User report review queue (verify or reject citizen reports)
- [ ] **ADMIN-04**: Safe zone management (add/edit hospitals, shelters, camps)
- [ ] **ADMIN-05**: Zone drawing tool via Leaflet-Geoman for affected area designation
- [ ] **ADMIN-06**: Notification broadcast panel (send alerts to custom zone)

### Volunteer System

- [ ] **VOL-01**: Volunteer registration with skills, resources, availability
- [ ] **VOL-02**: Admin volunteer verification workflow
- [ ] **VOL-03**: Volunteer dispatch: assign to nearby SOS requests
- [ ] **VOL-04**: Volunteer profile with mission history + reputation score
- [ ] **VOL-05**: Real-time availability status (available/deployed/offline)

## v2 Requirements

### Advanced Features (Deferred)

- **IVR/USSD integration** — Missed-call based SOS for non-smartphone users
- **Google Flood Hub integration** — Real-time satellite river gauge data
- **Damage assessment AI** — Satellite imagery analysis post-disaster
- **Offline district map download** — Pre-download vector maps per district
- **WhatsApp Bot (bidirectional)** — Report hazards + get shelter info via WhatsApp chat
- **Multi-language expansion** — Tamil, Marathi, Bengali, Telugu beyond EN/HI/Hinglish
- **Donation/supply coordination** — In-platform financial/material donation tracking
- **Community Safety Check (Family)** — "Mark Safe" group feature for neighborhoods
- **Government authority portal** — Separate role for district collectors / SDMA officials

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native iOS/Android app | Web PWA first; mobile app in v2 milestone |
| Real-time video streaming | Too bandwidth-heavy for rural 2G/4G users |
| P2P encrypted chat | Socket.io group chat deferred to v2 |
| In-platform payment processing | Donation flows link to external platforms in v1 |
| AI deepfake detection for reports | Complex, v2 roadmap |
| Commercial advertising | Never — safety platform |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 to INFRA-08 | Phase 1 | Pending |
| FE-01 to FE-06 | Phase 2 | Pending |
| MAP-01 to MAP-12 | Phase 3 | Pending |
| DATA-01 to DATA-07 | Phase 4 | Pending |
| NOTIF-01 to NOTIF-06 | Phase 5 | Pending |
| REPORT-01 to REPORT-07 | Phase 6 | Pending |
| SOS-01 to SOS-08 | Phase 7 | Pending |
| SAFE-01 to SAFE-06 | Phase 3 | Pending |
| AUTH-01 to AUTH-05 | Phase 2 | Pending |
| ML-01 to ML-06 | Phase 8 | Pending |
| ADMIN-01 to ADMIN-06 | Phase 6 | Pending |
| VOL-01 to VOL-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*
