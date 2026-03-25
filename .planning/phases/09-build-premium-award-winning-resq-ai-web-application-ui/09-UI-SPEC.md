# UI Design Contract — Phase 9: ResQ AI Premium UI

**Generated:** 2026-03-25
**Phase:** 09 — Build Premium Award-Winning ResQ AI Web Application UI
**Status:** Ready for planning

---

## 1. Design Direction

**Aesthetic:** Dark editorial command center. Premium glassmorphism over deep navy-black. Swiss typography mixed with dramatic serif italics. Motion is cinematic but purposeful — every transition reinforces the gravity of the platform. Target: **Awwwards Site of the Day** quality.

---

## 2. Design Tokens

### Colors (CSS Custom Properties on `:root`)

```css
:root {
  --bg: #06090F;
  --bg-surface: #0D1525;
  --bg-elevated: #141E30;
  --accent-red: #FF2D2D;
  --accent-orange: #FF6B1A;
  --accent-cyan: #00D4FF;
  --accent-green: #00E676;
  --accent-gold: #C8A96E;
  --glass: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.07);
  --text-primary: #EEF2FF;
  --text-muted: #5A6A8A;
  --text-dim: #2A3A55;
}
```

### Typography

| Role | Font | Weight | Style | Use |
|------|------|--------|-------|-----|
| Display/Hero | Playfair Display | 400, 700 | Italic | Headlines, hero text, dramatic moments |
| UI/Body | DM Sans | 300, 400, 500 | Normal | All UI text, body copy, labels |
| Data/Mono | JetBrains Mono | 400 | Normal | Coordinates, IDs, timestamps, live feeds |

**Loading:** Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

**Mixed typography rule:** Hero headlines mix Playfair Italic + DM Sans Upright in the same line.  
**Section labels:** `letter-spacing: 0.2em`, uppercase, 11px DM Sans, `--text-muted` or `--accent-gold`.

### Glass Card Mixin (apply to ALL panels/cards)

```css
.glass-card {
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
```

---

## 3. Global Animation System

### 3.1 Custom Cursor (desktop only, disabled on touch)

```
- Base: 10px filled circle, var(--accent-cyan), position: fixed, z-index: 9999, pointer-events: none
- Hover on links/buttons: expand to 52px, mix-blend-mode: difference, transition 0.3s
- Hover on maps/images: show text label "VIEW" / "OPEN" / "EXPLORE" inside cursor
- Hover on SOS button: turns var(--accent-red), pulses 
- Movement: JS lerp factor 0.1 on mousemove (smooth lag)
```

### 3.2 Page Transition

```
Mechanism: Framer Motion AnimatePresence on <Routes>
1. Dark panel (--bg) slides DOWN over current page (0.5s, cubic-bezier(0.76,0,0.24,1))
2. Thin --accent-red line races across top of panel (like loading bar, 0.4s)
3. Panel slides UP off new page (0.4s)
4. New page content: fade-in + translateY(40px → 0)
```

### 3.3 Text Reveal (ALL headings)

```
- Split text into word-span elements, each wrapped in overflow:hidden container
- On IntersectionObserver trigger (once): words translate Y(100% → 0), staggered 70ms/word
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Duration: 0.8s per word (stagger accumulates)
```

### 3.4 Lenis Smooth Scroll

```
- library: @studio-freight/lenis
- lerp: 0.075
- Init in main layout, provide ref to Framer Motion
```

### 3.5 Image/Map Reveal

```
- Container: overflow:hidden
- On scroll: --accent-red overlay panel slides left-to-right then off (clip-path or translateX)
- Image simultaneously scales 1.1 → 1.0 during reveal
```

### 3.6 Line Draw

```
- @keyframes line-draw: width 0% → 100%, duration 0.8s ease  
- Used as section dividers, triggered by IntersectionObserver
- Color: --accent-gold for section dividers
```

### 3.7 Parallax

```
- Hero text layer: scroll at 0.5x speed (CSS transform translateY on scroll)
- Background grid/mesh: 1.3x scroll speed
- Map section bg: 0.7x scroll speed
- Implement via JS scroll listener + requestAnimationFrame
```

### 3.8 Magnetic Buttons

```
- All primary CTAs: on mousemove within 80px radius, button translateX/Y by 30% of cursor offset
- On mouseleave: spring back to origin (transition 0.3s ease)
- SOS button: magnetic + continuous triple-ring CSS pulse animation
```

### 3.9 Data Shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.shimmer {
  background: linear-gradient(90deg, transparent 0%, var(--accent-gold) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}
```

### 3.10 Staggered Grid Reveal

```
- Cards: initial opacity:0, translateY(60px)
- On IntersectionObserver: animate to opacity:1, translateY(0)
- Stagger: 80ms per child card
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### 3.11 Number Counter

```
- On IntersectionObserver: count from 0 to target value
- Duration: 2000ms
- Easing: easeOutExpo curve
- Format preserved (decimals, commas, units like "min")
```

### 3.12 Infinite Marquee

```
- Two rows running in opposite directions
- CSS animation: @keyframes marquee with translateX
- Pause on hover: animation-play-state: paused on :hover
- Speed: ~30s per cycle
```

---

## 4. Page-Level UI Specifications

### 4.1 Navbar (all pages, fixed)

| Element | Spec |
|---------|------|
| Brand | "ResQ" DM Sans Bold 22px + "AI" Playfair Italic accent-red 22px |
| Nav links | tracked uppercase 11px, DM Sans, --text-muted |
| SOS pill | red border, --accent-red text, magnetic, 1px solid border, pulsing glow |
| Scroll state | backdrop-filter blur(20px) + --glass-border bottom border |
| Mobile | hamburger → full-screen --bg overlay, staggered Playfair 72px links |

### 4.2 Hero (/) 

| Element | Spec |
|---------|------|
| Background | --bg + animated SVG dot-grid mesh (pulsing wave) |
| Line 1 "when" | DM Sans 300, 80px, --text-muted |
| Line 2 "seconds" | Playfair Display Italic, 140px, --text-primary |
| Line 3 "matter," | DM Sans 300, 80px, --text-muted |
| Line 4 "data saves lives" | Playfair Bold Italic 100px; "data"=--accent-red, rest=--text-primary |
| Sub-copy | DM Sans 18px, --text-muted |
| CTA 1 SOS | filled --accent-red, white text, 32px box-shadow red, magnetic, triple-ring |
| CTA 2 Map | outline --accent-cyan, hover fills |
| Scroll indicator | bouncing dot + "scroll" DM Sans 11px, fades after 100px scroll |
| Status ticker | 🟢 14 Volunteers Online · 🔴 3 Critical Incidents · ⚡ Avg Response: 4.2 min, infinite marquee |

### 4.3 Severity Color System

| Severity | Color | CSS var |
|----------|-------|---------|
| Critical | #FF2D2D | --accent-red |
| High | #FF6B1A | --accent-orange |
| Medium | #F59E0B | (amber, direct) |
| Low | #5A6A8A | --text-muted |
| Resolved | #00E676 | --accent-green |
| Live | #00D4FF | --accent-cyan |

### 4.4 Map Page

```
- Tile URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
- Attribution: CartoDB dark matter
- Custom marker: SVG pin, color by severity
- Critical markers: triple-ring CSS pulse (scale + opacity keyframes)
- Popup: glass-card style, 280px wide, severity badge, [Dispatch Volunteer] button
- Heatmap toggle: top-right float button, adds rgba red/orange GeoJSON overlay
- Zoom controls: custom glass-card styled buttons, top-left
```

### 4.5 SOS Form Progress Bar

```
Step dots: --accent-gold, 12px circles
Active step dot: filled, --accent-gold glow
Connecting line: --accent-red, fills left-to-right as steps complete
```

### 4.6 Admin Donut Charts

```
SVG approach: stroke-dasharray + stroke-dashoffset animation
On mount: arcs draw clockwise from 0 to final angle
Duration: 1.2s ease-out
Size: ~120px diameter each
```

### 4.7 Auth Form Tab Indicator

```
Sliding pill: absolute-positioned divider between "Sign In" / "Register"
Transition: left/right on tab change, 0.3s ease
Background: --accent-cyan/20, border: 1px solid --accent-cyan
```

---

## 5. Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| < 768px (mobile) | Single column, clamp() font sizes, no custom cursor, simplified animations, stacked layouts |
| 768–1024px (tablet) | Adjusted grid columns, medium font sizes |
| > 1024px (desktop) | Full cinematic experience |

**Font size approach:** Use CSS `clamp()` for display text:
- Large hero: `clamp(48px, 9vw, 140px)`
- Section headings: `clamp(36px, 6vw, 100px)`
- Subheadings: `clamp(24px, 4vw, 80px)`

---

## 6. Interaction States

| State | Treatment |
|-------|-----------|
| Button hover | Lift + glow (box-shadow), scale(1.02), cursor change |
| Card hover | translateY(-8px), border brightens to --glass-border×2 |
| Input focus | Cyan underline animates from center outward |
| Badge active/selected | Filled background, scale(1.05), gold border |
| Button loading | Spinner replaces text, pointer-events:none |
| Button success | Color morphs from red → green, checkmark icon |

---

## 7. Z-Index Stack

| Layer | z-index | Component |
|-------|---------|-----------|
| Base content | 0–10 | Normal page content |
| Map | 100 | Leaflet map |
| Overlay | 200 | Modals, popups |
| Sidebar | 300 | Map sidebar |
| Navbar | 400 | Fixed navbar |
| Page transition | 500 | Dark overlay panel |
| Toast | 600 | Notification toasts |
| Cursor | 9999 | Custom cursor |

---

*UI-SPEC generated: 2026-03-25*
*Phase: 09-build-premium-award-winning-resq-ai-web-application-ui*
