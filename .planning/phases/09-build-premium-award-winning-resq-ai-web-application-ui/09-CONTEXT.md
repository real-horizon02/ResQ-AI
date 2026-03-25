# Phase 9: Build Premium Award-Winning ResQ AI Web Application UI — Context

**Gathered:** 2026-03-25
**Status:** Ready for planning
**Source:** PRD Express Path (user specification)

<domain>
## Phase Boundary

This phase delivers a complete, cinematic, award-winning UI/UX overhaul of the ResQ AI web application. The current app (phases 1–8) has functional backend and logic; this phase focuses entirely on the front-end experience: design system, all 7 pages, global animations, and polish that makes it competitive with Awwwards-level sites — while remaining genuinely functional for high-stakes emergency use.

**Deliverables:**
- Complete dark design system (CSS variables, typography, glassmorphism)  
- 7 fully-built pages: `/`, `/map`, `/sos`, `/volunteer`, `/admin`, `/auth`, `/profile`
- Global animation system (12 distinct animation types)
- Custom cursor (desktop), magnetic buttons, page transitions
- Smooth scroll (Lenis), scroll-triggered reveals, parallax
- Infinite marquees, number counters, staggered grid reveals
- Floating SOS button (all pages except /sos)
- Toast notification system (4 types)
- Offline mode banner
- 10 hardcoded India mock incidents, 6 volunteers, 10 admin feed entries
- Mobile-responsive (simplified on mobile, no custom cursor)

</domain>

<decisions>
## Implementation Decisions

### Design System
- **Background**: `--bg: #06090F`, `--bg-surface: #0D1525`, `--bg-elevated: #141E30`
- **Accents**: `--accent-red: #FF2D2D`, `--accent-orange: #FF6B1A`, `--accent-cyan: #00D4FF`, `--accent-green: #00E676`, `--accent-gold: #C8A96E`
- **Glass**: `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.07)`, `border-radius: 16px`
- **Text**: `--text-primary: #EEF2FF`, `--text-muted: #5A6A8A`, `--text-dim: #2A3A55`
- **Typography fonts**: Playfair Display (serif italic, display/impact), DM Sans (UI/body), JetBrains Mono (data/timestamps/IDs/coords)
- **Section labels**: tracked caps, `letter-spacing: 0.2em`, uppercase, 11px

### Global Animations (ALL 12 required)
1. **Custom cursor** — 10px filled cyan circle, expands 52px on hover (links/buttons), mix-blend-mode:difference, JS lerp 0.1, turns red + pulses on SOS hover. Desktop only.
2. **Page transition** — Full-viewport `--bg` panel slides DOWN (0.5s cubic-bezier(0.76,0,0.24,1)) then UP (0.4s), red racing line across top, new page content fades + translates Y+40px→0. Use AnimatePresence.
3. **Text reveal** — Split into words in `overflow:hidden` spans, Y+100%→0 staggered 70ms per word, easing `cubic-bezier(0.16,1,0.3,1)`, triggered once by IntersectionObserver.
4. **Lenis smooth scroll** — `@studio-freight/lenis` with lerp 0.075.
5. **Image/map reveal** — Accent-red wipe panel slides left→right→gone, image scales 1.1→1.0.
6. **Line draw** — Decorative lines animate width 0%→100% on scroll, 0.8s ease.
7. **Parallax** — Hero text at 0.5x, bg grid at 1.3x, map section bg at 0.7x scroll speed.
8. **Magnetic buttons** — CTA buttons move toward cursor within 80px radius (30% distance). SOS button: magnetic + continuous pulsing red ring.
9. **Data shimmer** — Gold shimmer sweep left→right on live data cards when data "arrives", 1.5s.
10. **Staggered grid reveal** — Cards animate Y+60px→0, opacity 0→1, 80ms stagger per card, IntersectionObserver.
11. **Number counter** — Stats count 0→value on scroll, 2s easeOutExpo.
12. **Infinite marquee** — Two rows opposite directions, pauses on hover.

### Page: `/` Home
- Fixed navbar: ResQ wordmark (DM Sans Bold) + AI (Playfair Italic, accent-red). Nav links tracked uppercase 11px. SOS pill button (red border, magnetic, pulsing glow). On scroll: blur(20px) + glass-border bottom.
- Mobile: hamburger → full-screen dark overlay, staggered Playfair 72px links.
- Hero 100vh: animated SVG dot-grid mesh, cinematic mixed-typography headline (4 lines: DM Sans 300 + Playfair Italic mix), two CTAs (SOS magnetic red + Map outline cyan), bottom-left brand label, bounce scroll indicator, live status ticker marquee.
- Section 2 Mission: 40/60 split, 4 animated stat counters, gold line draw.
- Section 3 Platform Preview: cinematic HTML/CSS mock UI with infinite drift animation.
- Section 4 How It Works: 5 steps connected by dashed lines draw on scroll.
- Section 5 Features: 2×3 glass card grid, hover lift + cyan glow.
- Section 6 Data Sources Marquee: 2 rows opposite directions.
- Section 7 Awards: 3 achievement cards, staggered scale-in.
- Section 8 Start a Mission CTA: giant text with letter scatter on hover.

### Page: `/map` Live Command Map
- 30vh hero strip, Playfair 100px reveal.
- Left sidebar (300px, fixed, glassmorphic): filters, incident list cards with severity borders, slides in from left on load.
- Leaflet fullscreen map: dark CartoDB tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`), custom SVG severity pins, triple-ring CSS pulse on critical, safe zone markers (hospitals green, shelters blue, relief camps orange).
- Marker click: glassmorphic popup with title, severity badge, description, `[Dispatch Volunteer]` button.
- AI Heatmap toggle: semi-transparent GeoJSON overlay.
- Float status bar: live counts.
- Custom glassmorphic zoom controls (replace Leaflet defaults).
- 10 mock India incidents hardcoded as GeoJSON.

### Page: `/sos` SOS Report
- 25vh hero strip: "emergency" Playfair red 100px + "report" DM Sans 300 80px.
- 3-step multi-step form with animated progress bar (red line + gold dots).
- Step 1: 3×2 icon grid (Flood/Earthquake/Fire/Medical/Landslide/Cyclone) + severity pills.
- Step 2: Geolocation auto-detect → lat/lng in JetBrains Mono + green ✓. Manual address + description. People affected +/− numeric.
- Step 3: Name + phone. Drag-drop photo upload with preview. Full-width red submit button → loading → success overlay.
- Offline banner: detects `navigator.onLine`, slide-down yellow sticky.
- Success screen: SVG animated checkmark, Playfair 64px, report ID in JetBrains Mono `#RSQ-2024-XXXXX`, countdown timer.

### Page: `/volunteer` Volunteer Hub
- 25vh hero strip.
- 65% task feed / 35% profile panel two-column layout.
- Task cards: glass, staggered reveal, severity badges, skill chips, 3 action buttons (Accept/Complete/Escalate) updating card state.
- Profile panel: avatar, name, city, status toggle (available/unavailable), skill badges, stats, mini Leaflet map (200px) with 5km radius circle.

### Page: `/admin` Admin Dashboard
- 20vh hero: "command"/"center", status bar `SYSTEM OPERATIONAL` green pulsing JetBrains Mono.
- 4 KPI stat cards: Playfair 56px numbers, tracked 11px labels, number counters, trend arrows, sparkline SVGs.
- 58% incident queue: glassmorphic table with ID/Type/Location/Severity/Status/Reported/Actions. Row actions (Verify/Dispatch/Resolve) transition badge color with color-morph animation. 10 rows India data.
- 42% right panel: Live activity feed (new item prepend every 5s via setInterval, max 8 items, JetBrains Mono 13px) + SVG donut charts (Volunteers: Deployed/Available/Offline; Relief Camps: Occupied/Available/Full) drawn with stroke-dashoffset animation.

### Page: `/auth` Authentication
- Full-viewport split-screen.
- Left 50%: brand panel (`--bg`), logo, tagline Playfair 48px, animated SVG radar/pulsing circles accent-red.
- Right 50%: `--bg-surface`, glass card, toggle tabs (Sign In / Register) with sliding pill indicator.
- Underline-only inputs, floating labels, cyan center-outward underline on focus.
- Sign In: email + password + magic link toggle.
- Register: name/email/phone/password + 3-pill role selector (Citizen/Volunteer/Admin with cyan glow on select).
- Mock auth: localStorage persist, redirect, toast notification.

### Page: `/profile` Profile Setup
- 20vh hero strip.
- 3-step onboarding form (same progress bar style as SOS form).
- Step 1: circular avatar upload. Name/age/phone underline inputs. Indian states select with glassmorphic dropdown.
- Step 2: skill chips grid (9 skills, gold on select). Certification upload card. Availability pill switch (green ✓ / gray).
- Step 3: summary glassmorphic panel + full-width red→green morphing submit button.

### Global Components
- **Toast system**: top-right, slide from right, auto-dismiss 4s, 4 types (success green, error red, warning yellow, info cyan).
- **Floating SOS button**: fixed bottom-right, all pages except `/sos`, red circle, triple-ring pulse, magnetic hover, routes to `/sos`.
- **Offline banner**: `navigator.onLine` event, slide-down yellow sticky, "📵 Offline — ResQ AI running in resilient mode".

### Mock Data
- 10 hardcoded India incidents with coordinates (Assam flood, Uttarakhand landslide, Mumbai collapse, Chennai cyclone, Delhi gas leak, Odisha flood, Kerala fire, Rajasthan heatwave, Bihar river overflow, Sikkim earthquake).
- 6 volunteers with names, skills, cities, availability.
- 10 admin activity log entries.

### Tech Stack (confirmed)
- React + Vite (existing project)
- React Router v6 with AnimatePresence page transitions
- Tailwind CSS + custom CSS variables (existing tailwind.config.js to be extended)
- `@studio-freight/lenis` for smooth scroll
- Framer Motion for page/component transitions
- Leaflet.js + React-Leaflet (existing in project)
- SVG donut charts (hand-coded)
- Custom React cursor component (useEffect + mousemove)
- Google Fonts: Playfair Display + DM Sans + JetBrains Mono (via index.html link)
- Lucide React icons (existing)
- Zustand (existing)
- All data: hardcoded JSON / mock state — NO new API calls in this phase

### the agent's Discretion
- Exact wave breakdown of plan files (how many PLAN.md files and their grouping)
- Specific Framer Motion variant structures
- Exact SVG paths for custom marker icons
- Exact scroll offset calculations for parallax factors
- CSS keyframe naming conventions beyond what's specified
- How to handle existing components vs. rewrite (prefer rewrite to match new design system)
- Order of implementation within waves

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Project Structure
- `src/index.css` — current CSS (Tailwind + custom, will be heavily extended)
- `tailwind.config.js` — current Tailwind config (extend with Phase 9 design tokens)
- `src/main.tsx` — app entry point + router setup
- `src/App.tsx` — top-level component
- `package.json` — current deps (leaflet, framer-motion, zustand, lucide-react all present)
- `vite.config.ts` — build config

### Existing Pages (to be overhauled)
- `src/pages/` — all existing page components

### Planning Reference
- `.planning/STATE.md` — project state
- `.planning/ROADMAP.md` — roadmap

</canonical_refs>

<specifics>
## Specific Ideas

### The Cinematic Headline (Hero Section)
```
Line 1: "when"         — DM Sans 300, 80px, --text-muted
Line 2: "seconds"      — Playfair Display Italic, 140px, --text-primary
Line 3: "matter,"      — DM Sans 300, 80px, --text-muted
Line 4: "data saves lives" — Playfair Bold Italic, 100px (data=accent-red, rest=text-primary)
```

### Stat Numbers on Home
- `1,247` Active Users
- `392` Incidents Resolved
- `48` Cities Covered
- `4.2 min` Avg Response Time

### 10 Mock Incidents (coordinates)
1. Assam — Flash Flood — Critical — (26.14°N, 91.74°E)
2. Uttarakhand — Landslide — High — (30.06°N, 79.01°E)
3. Mumbai — Building Collapse — Critical — (19.07°N, 72.87°E)
4. Chennai — Cyclone Warning — High — (13.08°N, 80.27°E)
5. Delhi — Gas Leak — Medium — (28.61°N, 77.20°E)
6. Odisha — Coastal Flooding — Critical — (20.29°N, 85.82°E)
7. Kerala — Forest Fire — High — (10.85°N, 76.27°E)
8. Rajasthan — Heatwave — Medium — (27.02°N, 74.21°E)
9. Bihar — River Overflow — High — (25.09°N, 85.31°E)
10. Sikkim — Earthquake Aftershock — Critical — (27.53°N, 88.51°E)

### Leaflet Map Tile URL
`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

### Page Transition Timing
- Overlay slides DOWN: 0.5s cubic-bezier(0.76,0,0.24,1)
- Overlay slides UP: 0.4s
- Red racing line: races across top during transition

</specifics>

<deferred>
## Deferred Ideas

- Real Supabase data integration (use mock data for all Phase 9 work)
- Twilio/WhatsApp actual sending (Phase 5 territory)
- AI/ML predictions overlay (Phase 8 territory)
- i18n/language switching (Phase 2 feature, don't break it but don't extend it)
- Actual auth with Supabase (Phase 2 territory — mock auth in localStorage for Phase 9 additions)

</deferred>

---
*Phase: 09-build-premium-award-winning-resq-ai-web-application-ui*
*Context gathered: 2026-03-25 via PRD Express Path (user specification)*
