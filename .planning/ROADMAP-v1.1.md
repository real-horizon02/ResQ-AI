# ResQ AI: Roadmap — Milestone v1.1

**Version:** v1.1 (Quality, UI/UX & Interactivity Overhaul)
**Granularity:** Standard (4 phases, 3-5 plans each)
**Continues from:** v1.0 Phase 8

---

## Phase 9: Code Audit & Optimization

**Goal:** Fix all code quality issues — TypeScript types, error handling, loading states, real data fetching, and PostGIS coordinate parsing.

**Plans:**
1. **9.1 — TypeScript Strictness** — Replace all `any` types in stores, hooks, and components with proper interfaces. Add strict type definitions for Supabase tables.
2. **9.2 — Error Boundaries & Loading States** — Add React error boundaries at route level, implement skeleton loading states for every data-fetching page, replace browser `alert()` calls with toast notifications.
3. **9.3 — Data Integration Fixes** — Fix Home page to fetch real stats from Supabase (active disasters count, volunteer count, SOS resolution rate). Fix Admin dashboard PostGIS coordinate parsing. Wire up DataFreshness component to real data timestamps.

**Requirements covered:** QUAL-01 to QUAL-06

**Success Criteria:**
1. Zero `any` types in codebase
2. Every page shows a skeleton/spinner while loading
3. Component crashes show error boundary fallback, not white screen
4. Home page stats reflect live Supabase data
5. Admin SOS alerts show real coordinates from PostGIS

---

## Phase 10: UI/UX Redesign via Stitch

**Goal:** Redesign every page using Stitch MCP for professional, premium UI/UX — then implement the designs in code.

**Plans:**
1. **10.1 — Design System Refresh** — Use Stitch to generate a comprehensive design system (colors, typography, spacing, component styles). Update Tailwind config and global CSS to match.
2. **10.2 — Page Redesigns (Home, Auth, Map)** — Use Stitch to design Home, Auth, and Map pages. Implement redesigned layouts with premium glassmorphism, gradients, animations.
3. **10.3 — Page Redesigns (Report, Admin, Volunteer)** — Use Stitch to design Report, Admin Dashboard, and Volunteer Dashboard. Implement with consistent design language.
4. **10.4 — Header & Navigation Redesign** — Use Stitch to design responsive Header with mobile drawer, active link states, user avatar dropdown, notification bell. Implement fully.

**Requirements covered:** UIUX-01 to UIUX-07

**Success Criteria:**
1. Every page matches Stitch-generated design
2. Consistent design system (colors, fonts, spacing) across entire app
3. Mobile-responsive on all pages
4. Smooth micro-animations and transitions
5. Premium glassmorphism aesthetic maintained

---

## Phase 11: Full Interactivity

**Goal:** Make every button, link, and clickable element functional and reactive — no dead links, no non-functional buttons.

**Plans:**
1. **11.1 — Navigation Fixes** — Fix all dead `#` links in Header (Safe Zones → map with safe zone filter, Reports → /report, Volunteer → /volunteer). Add active link highlighting based on current route.
2. **11.2 — Home Page Interactivity** — Wire "Get Help" button to SOS/safe zones flow, "Volunteer" button to /volunteer, Safe Zones card to /map?layer=safezones, Reports card to /report.
3. **11.3 — Auth-Aware Header** — Show user avatar + dropdown when signed in (Profile, Sign Out). Hide Sign In button when authenticated. Show Admin/Volunteer links conditionally based on user role from profiles table.
4. **11.4 — Notification System** — Implement notification bell with unread count badge, dropdown showing recent disaster alerts from notifications table, mark-as-read functionality.

**Requirements covered:** INTX-01 to INTX-09

**Success Criteria:**
1. Zero dead links in entire app
2. Every button navigates or performs its labeled action
3. Header reflects auth state (signed in vs anonymous)
4. Notification bell shows live unread count
5. Role-based nav visibility works (admin sees admin link)

---

## Phase 12: Map Integration Overhaul

**Goal:** Transform the basic Leaflet map into a feature-rich interactive disaster monitoring dashboard with search, filters, clustering, routing, and real-time updates.

**Plans:**
1. **12.1 — Search & Clustering** — Add location search bar with Nominatim geocoding autocomplete. Implement Leaflet.markercluster for disaster markers and safe zone markers.
2. **12.2 — Filters & Layer Controls** — Add filter panel (by disaster type, severity level). Toggle layers on/off (disasters, safe zones, heatmap, user reports). Persistent filter state via URL params.
3. **12.3 — Rich Markers & Popups** — Animated pulsing markers for critical/active disasters. Rich popups with severity badge, time ago, description, source, "View Details" and "Get Directions" buttons. Safe zone popups with capacity bar, phone number, directions link.
4. **12.4 — Routing & Real-Time** — Leaflet Routing Machine integration for directions to safe zones. Supabase Realtime subscription on disaster_events for live marker updates. Auto-fit bounds to user's area on initial load.

**Requirements covered:** MAPI-01 to MAPI-10

**Success Criteria:**
1. User can search for any Indian location and map flies to it
2. Markers cluster at zoom levels 4-8, expand at higher zoom
3. At least 3 filter options functional (type, severity, layer toggle)
4. Clicking a safe zone popup shows route on map
5. New disaster events appear on map within 5 seconds via Realtime

---

## Verification Plan

### Automated
- `npm run build` — zero TypeScript errors after Phase 9
- `deno check` on all edge functions — zero errors

### Browser Testing (via browser tool)
- After each phase: navigate all pages, verify no white screens, check console for errors
- Phase 11: click every nav link, verify correct navigation
- Phase 12: search for "Mumbai", verify map pans to location; click safe zone, verify popup

### Manual Verification
- User reviews Stitch designs before implementation (Phase 10)
- User tests on mobile viewport after Phase 10

---

*Roadmap created: 2026-03-25*
*4 phases (9-12) — Standard granularity — 32 requirements — 100% coverage*
