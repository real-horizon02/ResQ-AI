# Requirements: ResQ AI — Milestone v1.1

**Defined:** 2026-03-25
**Core Value:** Lives saved through AI-driven early warnings and frictionless emergency access — before and during a disaster.

## v1.1 Requirements

### Code Quality & Optimization (QUAL)

- [ ] **QUAL-01**: User sees proper TypeScript types everywhere — no `any` types in stores, hooks, or components
- [ ] **QUAL-02**: User encounters error boundaries — graceful fallbacks on component crashes instead of white screens
- [ ] **QUAL-03**: User experiences consistent loading states on every page and data-fetching component
- [ ] **QUAL-04**: User gets proper error messages from API failures — toast notifications instead of browser alerts
- [ ] **QUAL-05**: Admin dashboard correctly parses and displays PostGIS coordinates (not placeholder 0,0)
- [ ] **QUAL-06**: User sees real data counts on Home page — stats fetched from Supabase instead of hardcoded values

### UI/UX Redesign (UIUX)

- [ ] **UIUX-01**: User sees a professionally redesigned Home page with premium Stitch-designed layout
- [ ] **UIUX-02**: User sees a redesigned Auth page with polished Stitch-designed login/signup flow
- [ ] **UIUX-03**: User sees a redesigned Map page with Stitch-designed controls, panels, and overlays
- [ ] **UIUX-04**: User sees a redesigned Report page with improved form UX via Stitch design
- [ ] **UIUX-05**: User sees a redesigned Admin Dashboard with premium Stitch-designed command center layout
- [ ] **UIUX-06**: User sees a redesigned Volunteer Dashboard with Stitch-designed mission cards
- [ ] **UIUX-07**: User sees a redesigned Header with proper mobile drawer, active link highlighting, and user avatar

### Interactivity & Navigation (INTX)

- [ ] **INTX-01**: User can navigate to all pages via Header links — no dead `#` links
- [ ] **INTX-02**: User clicks "Get Help" on Home and is taken to the SOS flow or nearest safe zones
- [ ] **INTX-03**: User clicks "Volunteer" button on Home and navigates to Volunteer registration/dashboard
- [ ] **INTX-04**: User clicks Safe Zones card on Home and sees safe zones directory on map
- [ ] **INTX-05**: User clicks Reports card on Home and is taken to the Report page
- [ ] **INTX-06**: User sees notification bell with unread count and dropdown of recent alerts
- [ ] **INTX-07**: User who is signed in sees profile avatar in header instead of Sign In button
- [ ] **INTX-08**: User can sign out from Header user menu dropdown
- [ ] **INTX-09**: Admin/Volunteer nav links are conditionally visible based on user role

### Map Integration (MAPI)

- [ ] **MAPI-01**: User can search for locations on the map via search bar with autocomplete
- [ ] **MAPI-02**: User sees clustered markers that expand on zoom (Leaflet.markercluster)
- [ ] **MAPI-03**: User can filter map markers by disaster type (earthquake, flood, fire, etc.)
- [ ] **MAPI-04**: User can filter map markers by severity level (critical, high, medium, low)
- [ ] **MAPI-05**: User sees animated pulsing markers for active/critical disasters
- [ ] **MAPI-06**: User sees rich popups on disaster markers with severity, time, description, and action buttons
- [ ] **MAPI-07**: User sees rich popups on safe zone markers with capacity, contact, and "Get Directions" button
- [ ] **MAPI-08**: User can toggle layers on/off (disasters, safe zones, heatmap, user reports)
- [ ] **MAPI-09**: User sees real-time map updates via Supabase Realtime subscriptions
- [ ] **MAPI-10**: User can get routing directions to nearest safe zone from current location

## Out of Scope

| Feature | Reason |
|---------|--------|
| SOS system (Phase 7) | Paused v1.0 phase — this milestone is about polish |
| AI/ML predictions (Phase 8) | Paused v1.0 phase — separate milestone |
| Leaflet-Geoman admin drawing | Deferred to admin-focused milestone |
| Offline-first PWA optimization | Deferred to separate milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUAL-01 to QUAL-06 | Phase 9 | Pending |
| UIUX-01 to UIUX-07 | Phase 10 | Pending |
| INTX-01 to INTX-09 | Phase 11 | Pending |
| MAPI-01 to MAPI-10 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after milestone v1.1 initialization*
