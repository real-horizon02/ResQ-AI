---
wave: 6
depends_on: [04-PLAN-home-page, 05-PLAN-map-page, 06-PLAN-sos-page, 07-PLAN-volunteer-page, 08-PLAN-admin-page, 09-PLAN-auth-profile-pages]
files_modified:
  - src/index.css
  - src/components/Navbar.tsx
  - src/pages/Home.tsx
  - src/pages/Map.tsx
  - src/pages/SOS.tsx
  - src/pages/Volunteer.tsx
  - src/pages/Admin.tsx
  - src/pages/Auth.tsx
autonomous: true
requirements_addressed: [UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07]
---

# Plan 10: Responsive Polish & Cross-Page Integration

## Objective
Final wave: apply responsive CSS across all pages, fix any cross-page wiring issues, verify the app builds and navigates correctly. Disable custom cursor + simplify animations on mobile.

## must_haves
- [ ] Mobile (< 768px): single column layouts, clamp() font sizes, no custom cursor, simplified animations
- [ ] Tablet (768–1024px): adjusted grids, medium sizes
- [ ] Hamburger menu works on mobile (already in Navbar — verify)
- [ ] All 7 routes navigate correctly between each other
- [ ] No broken imports or TypeScript errors
- [ ] App builds with `npm run build` without errors
- [ ] Leaflet CSS import not causing SSR/build errors
- [ ] @studio-freight/lenis installed and functioning

## Tasks

### Task 1: Responsive layout audit — add CSS media queries

<read_first>
- src/index.css
- src/pages/Home.tsx
- src/pages/Map.tsx
- src/pages/Volunteer.tsx
- src/pages/Admin.tsx
</read_first>

<action>
Add the following responsive CSS rules to the END of `src/index.css`:

```css
/* ── Responsive Breakpoints ────────────────────────────── */

/* Disable custom cursor on touch devices */
@media (hover: none), (pointer: coarse) {
  body { cursor: auto !important; }
  button, a, [role="button"] { cursor: pointer !important; }
}

/* Mobile breakpoint: < 768px */
@media (max-width: 767px) {
  /* Single column for multi-column layouts */
  .desktop-two-col { flex-direction: column !important; }
  .desktop-grid-2x3 { grid-template-columns: 1fr 1fr !important; }
  
  /* Sidebar hidden on mobile map page */
  .mobile-hide { display: none !important; }
  
  /* Reduce padding for hero sections */
  .hero-pad { padding-left: 24px !important; padding-right: 24px !important; }
  
  /* Reduce animation complexity */
  .animate-float-drift { animation: none !important; transform: none !important; }
  
  /* Stack admin grid */
  .admin-grid { flex-direction: column !important; }
  
  /* Reduce KPI card row */
  .kpi-row { flex-wrap: wrap !important; }
  .kpi-row > * { flex: 1 1 calc(50% - 8px) !important; min-width: 140px; }
  
  /* Floating SOS: smaller on mobile */
  .floating-sos { width: 52px !important; height: 52px !important; bottom: 20px !important; right: 20px !important; }
  
  /* Auth page: stacked */
  .auth-split { flex-direction: column !important; }
  .auth-split > * { width: 100% !important; min-height: 50vh; }
}

/* Tablet breakpoint: 768–1024px */
@media (min-width: 768px) and (max-width: 1023px) {
  .desktop-grid-2x3 { grid-template-columns: 1fr 1fr !important; }
  .admin-grid > *:first-child { flex: 0 0 55% !important; }
}
```

Then apply these classes to the appropriate containers in each page:
- Volunteer page left/right split → add `desktop-two-col` class
- Admin main content area → add `admin-grid` class + `desktop-two-col`
- Admin KPI row → add `kpi-row` class
- Auth page split → add `auth-split` class
- Features grid container → add `desktop-grid-2x3` class
- Map sidebar → add `mobile-hide` class
</action>

<acceptance_criteria>
- `src/index.css` contains `@media (max-width: 767px)` block
- Media query block contains `.desktop-two-col { flex-direction: column !important; }`
- Media query block contains `.mobile-hide { display: none !important; }`
- Media query block contains `@media (hover: none)` cursor reset
- `.auth-split` class exists and is applied to Auth page split container
- `.admin-grid` class exists and is applied to Admin main grid
</acceptance_criteria>

---

### Task 2: Cross-page navigation wiring check

<read_first>
- src/App.tsx
- src/components/Navbar.tsx
</read_first>

<action>
Verify and fix navigation in App.tsx and all pages:
1. Ensure `<Routes>` is wrapped in `useLocation`-aware `AnimatePresence` in PageTransition
2. Check all `<Link to="...">` refs point to correct paths: `/`, `/map`, `/sos`, `/volunteer`, `/admin`, `/auth`, `/profile`
3. Add navbar to all pages that don't have it yet (Auth and SOS pages should also show Navbar)
4. Ensure the Profile page is linked from the Auth page's success flow
5. Add `<Navbar />` to Profile page if missing
6. Ensure `useAuthStore.user` name is shown in Navbar when logged in (small text right side)
</action>

<acceptance_criteria>
- `src/App.tsx` has routes for all 7 paths: `/`, `/map`, `/sos`, `/volunteer`, `/admin`, `/auth`, `/profile`
- Navbar renders on SOS and Auth pages
- Clicking each nav link renders the correct page without console errors
- `useAuthStore.user?.name` is shown in Navbar when logged in
</acceptance_criteria>

---

### Task 3: Lenis + build verification

<read_first>
- package.json
- src/hooks/useLenis.ts
- src/App.tsx
</read_first>

<action>
1. Verify `@studio-freight/lenis` is installed: check `package.json`. If missing, install: `npm install @studio-freight/lenis`
2. Ensure `useLenis()` is called in `App.tsx` (already planned in PLAN-02 — verify it's there)
3. Fix any Leaflet CSS import issues: in `src/components/map/DarkLeafletMap.tsx`, verify `import 'leaflet/dist/leaflet.css'` is present
4. Run `npm run build` and document any TypeScript errors to fix
5. Common TypeScript fixes:
   - Add `as any` to `ref={ref as any}` for DOM refs on HTML elements
   - Ensure `Incident['status']` type is correct
   - Check `framer-motion` version supports `AnimatePresence mode="wait"`
</action>

<acceptance_criteria>
- `npm run build` completes without TypeScript errors (or only warnings)
- `package.json` contains `@studio-freight/lenis`
- `DarkLeafletMap.tsx` contains `import 'leaflet/dist/leaflet.css'`
- `src/App.tsx` calls `useLenis()`
</acceptance_criteria>

---

### Task 4: Final visual polish — typography & spacing

<read_first>
- src/pages/Home.tsx
- src/index.css
</read_first>

<action>
Final polish pass:
1. Ensure all `<h1>`, `<h2>` heading elements are using correct fonts per the spec:
   - Section headings with "rescue lifecycle", "built for impact" etc. → Playfair Italic
   - UI text → DM Sans
   - Coordinates, IDs, timestamps → JetBrains Mono
2. Ensure all section label-caps (e.g. `[ 001 — MISSION ]`) use `label-caps-gold` class
3. Verify glass-card class is applied to all panels (not custom duplicated styles)
4. Check that `color: var(--text-primary)` vs `color: var(--text-muted)` contrast is applied at all body text
5. Add a consistent `min-height: 100vh` with `--bg` background to all pages
6. Remove any remaining light-theme styles: check for `bg-white`, `text-gray-900`, `bg-gray-50` Tailwind classes and replace with equivalent dark-theme classes or CSS vars
</action>

<acceptance_criteria>
- No `bg-white` Tailwind class remains in page files
- No `text-gray-900` or `text-gray-800` class remains in page files  
- All `label-caps-gold` usage replaced old `label-caps` for gold accent labels
- All page root divs have `background: 'var(--bg)'` or `bg-[var(--bg)]`
- Checking 2-3 random pages: headings use correct Playfair/DM Sans fonts
</acceptance_criteria>

## Final Verification

```bash
# Full TypeScript type check
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Build verification
npm run build 2>&1 | tail -10

# Key file existence checks
ls src/components/ui/CustomCursor.tsx
ls src/components/ui/PageTransition.tsx
ls src/components/ui/Toast.tsx
ls src/components/ui/FloatingSOS.tsx
ls src/hooks/useLenis.ts
ls src/data/mockData.ts

# Design token check
grep "var(--bg)" src/index.css | wc -l
grep "@keyframes" src/index.css | wc -l

# No remaining light theme
grep -r "bg-white\|text-gray-900" src/pages/ | wc -l
```
