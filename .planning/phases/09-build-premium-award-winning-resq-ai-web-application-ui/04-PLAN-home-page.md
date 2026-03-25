---
wave: 3
depends_on: [01-PLAN-design-system, 02-PLAN-global-components, 03-PLAN-mock-data-store]
files_modified:
  - src/components/Navbar.tsx
  - src/pages/Home.tsx
  - src/components/home/HeroSection.tsx
  - src/components/home/MissionSection.tsx
  - src/components/home/PlatformPreview.tsx
  - src/components/home/HowItWorks.tsx
  - src/components/home/FeaturesGrid.tsx
  - src/components/home/DataSourcesMarquee.tsx
  - src/components/home/AwardsSection.tsx
  - src/components/home/StartMissionCTA.tsx
autonomous: true
requirements_addressed: [UI-01]
---

# Plan 04: Home Page & Navbar

## Objective
Build the complete home page (/) with all 8 sections and the global Navbar. This is the showpiece page — every animation and design decision must be precisely implemented.

## must_haves
- [ ] Navbar: brand logo, nav links, SOS pill, scroll blur effect, mobile hamburger menu
- [ ] Hero: SVG dot-grid mesh background, cinematic mixed-typography headline, two CTAs, scroll indicator, status ticker marquee
- [ ] Mission section: stat counters (×4), gold line draw
- [ ] Platform preview: floating HTML/CSS mock UI with drift animation
- [ ] How It Works: 5 steps with dashed connecting lines
- [ ] Features grid: 2×3 glass cards with hover effects, staggered reveal
- [ ] Data sources: 2-row opposite marquee
- [ ] Awards: 3 achievement cards
- [ ] Start Mission CTA: letter scatter on hover

## Tasks

### Task 1: Navbar component

<read_first>
- src/components/Navbar.tsx (if exists — check current implementation)
- src/index.css
- src/store/useAuthStore.ts
</read_first>

<action>
Create/replace `src/components/Navbar.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Map', href: '/map' },
    { label: 'Volunteer', href: '/volunteer' },
    { label: 'Admin', href: '/admin' },
    { label: 'About', href: '#' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        padding: scrolled ? '12px 32px' : '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
        background: scrolled ? 'rgba(6,9,15,0.8)' : 'transparent',
        transition: 'all 0.3s ease',
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>ResQ</span>
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 22, color: 'var(--accent-red)' }}>AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <Link key={l.label} to={l.href} className="label-caps" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
              {l.label}
            </Link>
          ))}
          <button className="btn-sos" onClick={() => navigate('/sos')}
            style={{ fontSize: 13, padding: '8px 20px', borderRadius: 999, fontFamily: 'DM Sans', fontWeight: 700, border: '1px solid var(--accent-red)', background: 'transparent', color: 'var(--accent-red)', cursor: 'none', boxShadow: '0 0 16px rgba(255,45,45,0.2)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--accent-red)'; (e.target as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = 'var(--accent-red)'; }}
          >
            🚨 SOS
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={28} />
            </button>
            {navLinks.map((l, i) => (
              <motion.div key={l.label} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: i * 0.08 } }}>
                <Link to={l.href} onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 72, color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1 }}>
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <button className="btn-sos" onClick={() => { navigate('/sos'); setMenuOpen(false); }} style={{ fontSize: 16, padding: '14px 32px' }}>
              🚨 Send SOS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/Navbar.tsx` contains `scrolled` state
- `src/components/Navbar.tsx` contains `backdropFilter: scrolled ? 'blur(20px)'`
- `src/components/Navbar.tsx` contains mobile hamburger menu with `AnimatePresence`
- `src/components/Navbar.tsx` contains Playfair 72px links in mobile overlay
- `src/components/Navbar.tsx` contains `ResQ` + `AI` brand split with different fonts/colors
</acceptance_criteria>

---

### Task 2: Home page Hero section

<read_first>
- src/index.css (check .btn-sos, .font-playfair, animation keyframes)
- src/hooks/useMagneticButton.ts
</read_first>

<action>
Create `src/components/home/HeroSection.tsx` with:
- 100vh height, `--bg` background
- Animated SVG dot-grid mesh (grid of circles slowly pulsing in wave pattern using JS offset)
- Cinematic 4-line mixed-typography headline with word-reveal animation on load
- Two magnetic CTAs: Send SOS (red filled) and View Live Map (cyan outline)
- Bottom-left: `EST. 2024 — ANTIGRAVITY AI` label-caps
- Bottom-right: animated bounce-dot scroll indicator (fades after 100px scroll)
- Infinite horizontal marquee status ticker at bottom:
  `🟢 14 Volunteers Online · 🔴 3 Critical Incidents · ⚡ Avg Response: 4.2 min`

Key implementation notes:
- Lines 1 & 3 ("when", "matter,"): `font-family: 'DM Sans'`, font-weight: 300, `clamp(48px, 6vw, 80px)`, `color: var(--text-muted)`
- Line 2 ("seconds"): `font-family: 'Playfair Display'`, italic, `clamp(72px, 10vw, 140px)`, `color: var(--text-primary)`
- Line 4 ("data saves lives"): Playfair italic bold, `clamp(56px, 7vw, 100px)`, "data" = `var(--accent-red)`, rest = `var(--text-primary)`
- Sub-copy: DM Sans 18px `--text-muted`: "AI-powered disaster coordination platform for a resilient India."
- Reveal animation: use `useEffect` on mount, delay word reveals by 200ms then stagger 70ms each
- SVG dot grid: render a grid of 20×12 small circles (2px radius), each with a sine-wave offset based on `Math.sin(x + y + time) * 0.5` opacity, animated with requestAnimationFrame
</action>

<acceptance_criteria>
- `src/components/home/HeroSection.tsx` exists
- File contains the word "seconds" with `Playfair Display` font reference
- File contains ticker marquee with "Volunteers Online" text
- File contains scroll indicator with `animate-bounce-dot` class or equivalent
- File contains `useEffect` for word-reveal animation
- File contains SVG dot-grid mesh (either SVG elements or canvas)
</acceptance_criteria>

---

### Task 3: Mission statement section

<read_first>
- src/hooks/useNumberCounter.ts
- src/index.css
</read_first>

<action>
Create `src/components/home/MissionSection.tsx`:
- 80vh min-height section, padding 80px 64px
- Left column (40%): `[ 001 — MISSION ]` in `label-caps-gold`
- Right column (60%):
  - Large paragraph, DM Sans 26px, line-height 1.7, `--text-primary`
  - Use `useTextReveal` hook on the paragraph ref
- 4 stat cards in a row using `useNumberCounter` hook:
  - `1247` Active Users
  - `392` Incidents Resolved
  - `48` Cities Covered
  - `4.2` (display as "4.2 min") Avg Response Time
- Numbers in Playfair Display 56px `--text-primary`, labels in `label-caps`
- Gold decorative `<hr>` line between text and stats using `line-draw` animation
</action>

<acceptance_criteria>
- `src/components/home/MissionSection.tsx` exists
- File imports `useNumberCounter`
- File contains `1247` and `392` target values
- File contains `label-caps-gold` class usage
</acceptance_criteria>

---

### Task 4: Platform preview mock UI

<read_first>
- src/index.css (check animate-float-drift)
</read_first>

<action>
Create `src/components/home/PlatformPreview.tsx`:
- Full-width section, dark `--bg` bg with subtle grid line overlay
- A cinematic HTML/CSS mock of the map dashboard — NOT an image, rendered as actual components:
  - Outer card: `glass-card` 960px wide max, border-radius 16px, `animate-float-drift` class (8s gentle up/down)
  - Header bar: "ResQ AI Command Center" label + `🟢 LIVE` badge
  - Inner layout: dark rectangle representing the map (with a few mock pulsing markers), a sidebar card with 3 fake incident cards
  - Mock incident cards: glass-card-elevated with colored severity borders, fake title/location text
- Overlaid text (absolute, centered, z-index 10): `"Real-time. Everywhere. Always."` Playfair Italic `clamp(40px, 6vw, 72px)` white
- 3 feature pills below: cyan dot + "Live Incident Feed" / "AI Risk Heatmap" / "Offline-First"
</action>

<acceptance_criteria>
- `src/components/home/PlatformPreview.tsx` exists
- File contains `animate-float-drift` class
- File contains the text "Real-time. Everywhere. Always."
- File contains 3 feature pill elements
</acceptance_criteria>

---

### Task 5: How It Works steps

<read_first>
- src/index.css (check step-dashes keyframe)
</read_first>

<action>
Create `src/components/home/HowItWorks.tsx`:
- Section heading: `"the rescue lifecycle"` — Playfair Italic `clamp(48px,6vw,80px)` centered
- 5 steps in a horizontal row (flex, wrap on mobile):
  - Step labels: `01–05`, ghost number opacity 0.05, 120px, absolute behind step name
  - Step name in Playfair 28px
  - Short description DM Sans 14px `--text-muted`
  - Each step separated by a dashed SVG line (use `<svg><line stroke-dasharray="6 4"/>`)
- On scroll: use IntersectionObserver per step. When step enters view, it animates from opacity 0.2→1 and the connecting dashed SVG line "draws" via `stroke-dashoffset` animation
- Steps: `01 Citizen Reports → 02 AI Processing → 03 Admin Verification → 04 Volunteer Dispatch → 05 Incident Resolved`
</action>

<acceptance_criteria>
- `src/components/home/HowItWorks.tsx` exists
- File contains `stroke-dashoffset` or `stroke-dasharray` for the dashed lines
- File contains 5 step items matching the exact labels above
- File contains IntersectionObserver for step reveal
</acceptance_criteria>

---

### Task 6: Features 2×3 grid

<read_first>
- src/hooks/useStaggeredReveal.ts
- src/index.css (check glass-card hover styles)
</read_first>

<action>
Create `src/components/home/FeaturesGrid.tsx`:
```tsx
const FEATURES = [
  { icon: '📡', title: 'Real-Time Monitoring', desc: 'Live data from USGS, IMD, NASA FIRMS — updated every 5 minutes.' },
  { icon: '🚨', title: 'Sub-Second SOS', desc: 'One tap sends your GPS location to NDRF + local volunteers instantly.' },
  { icon: '🤖', title: 'AI Risk Heatmaps', desc: 'XGBoost flood prediction overlays with confidence intervals.' },
  { icon: '📵', title: 'Offline-First', desc: 'Works without internet. Reports queue and sync when connection restores.' },
  { icon: '🛡️', title: 'Volunteer Network', desc: 'Verified first responders dispatched within 5km using PostGIS spatial queries.' },
  { icon: '📊', title: 'Admin Command Center', desc: 'Real-time incident management, resource allocation, and broadcast alerts.' },
];
```
- Section label `[ 002 — FEATURES ]` in `label-caps-gold`
- 2×3 grid of glass-card components
- Each card: icon 40px, title Playfair 24px (non-italic), description DM Sans 14px `--text-muted`
- On hover: `translateY(-8px)`, border brightens to `rgba(0,212,255,0.3)`, cyan accent line draws across bottom
- Use `useStaggeredReveal` hook on the grid container
</action>

<acceptance_criteria>
- `src/components/home/FeaturesGrid.tsx` exists
- File contains all 6 feature objects
- File contains `useStaggeredReveal` import and usage
- File contains `translateY(-8px)` hover effect
</acceptance_criteria>

---

### Task 7: Data sources marquee + Awards + Start Mission CTA

<read_first>
- src/index.css (check animate-marquee, animate-marquee-reverse)
</read_first>

<action>
Create `src/components/home/DataSourcesMarquee.tsx`:
- Two rows scrolling in opposite directions
- Row 1: `USGS Earthquake API · IMD Weather · NDMA · OpenStreetMap · Supabase Realtime · ISRO Bhuvan`
- Row 2: `PostGIS · Supabase Edge Functions · GDACS · WHO Emergency · Copernicus Emergency · NRSC`
- Each item: DM Sans Bold 18px `--text-muted`, all-caps, separated by `·`
- Apply `animate-marquee` to row 1 container, `animate-marquee-reverse` to row 2
- Duplicate content for seamless loop

Create `src/components/home/AwardsSection.tsx`:
- Title: `"built for impact"` Playfair Italic `clamp(48px,6vw,80px)` white
- Sub: DM Sans 20px italic `--text-muted`
- 3 glass cards with staggered scale-in: "Awwwards Nominee" / "2× Hackathon Winner" / "500+ Beta Users"

Create `src/components/home/StartMissionCTA.tsx`:
- 100vh section, `--bg`, centered content
- Giant text: `"start a mission"` — Playfair Italic, `clamp(56px, 9vw, 130px)`, `--text-primary`
- Letter scatter on hover: wrap each letter in a `<span>`, on mouseenter add random `translate(±20px)` via CSS var or inline style, on mouseleave reset
- Contact info 2-column below: DM Sans 16px
- Gold `[↑]` bottom-right button scrolls to top
</action>

<acceptance_criteria>
- `src/components/home/DataSourcesMarquee.tsx` contains `animate-marquee` and `animate-marquee-reverse`
- `src/components/home/DataSourcesMarquee.tsx` contains "USGS Earthquake API" text
- `src/components/home/AwardsSection.tsx` contains "Awwwards Nominee"
- `src/components/home/StartMissionCTA.tsx` contains letter scatter logic (individual `<span>` per letter)
</acceptance_criteria>

---

### Task 8: Assemble Home page

<read_first>
- src/pages/Home.tsx (if exists)
- src/components/Navbar.tsx
- All home section components just created
</read_first>

<action>
Create/replace `src/pages/Home.tsx`:
```tsx
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/home/HeroSection';
import { MissionSection } from '../components/home/MissionSection';
import { PlatformPreview } from '../components/home/PlatformPreview';
import { HowItWorks } from '../components/home/HowItWorks';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { DataSourcesMarquee } from '../components/home/DataSourcesMarquee';
import { AwardsSection } from '../components/home/AwardsSection';
import { StartMissionCTA } from '../components/home/StartMissionCTA';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <MissionSection />
      <PlatformPreview />
      <HowItWorks />
      <FeaturesGrid />
      <DataSourcesMarquee />
      <AwardsSection />
      <StartMissionCTA />
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/pages/Home.tsx` imports all 8 section components
- `src/pages/Home.tsx` imports `Navbar`
- When navigating to `/`, all sections render without errors
</acceptance_criteria>

## Verification

```bash
# Build check (no TypeScript errors)
npx tsc --noEmit 2>&1 | head -20

# Check all home components exist
ls src/components/home/

# Ensure correct section count
grep -c "import" src/pages/Home.tsx
```
