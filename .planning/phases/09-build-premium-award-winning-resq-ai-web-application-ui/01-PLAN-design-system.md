---
wave: 1
depends_on: []
files_modified:
  - src/index.css
  - tailwind.config.js
  - index.html
autonomous: true
requirements_addressed: [UI-DESIGN-SYSTEM]
---

# Plan 01: Design System & Global CSS Foundation

## Objective
Replace the current light Tailwind design system with the dark cinematic ResQ AI design system. Install all Phase 9 fonts, define all CSS custom properties, and extend Tailwind config.

## must_haves
- [ ] All `--bg`, `--accent-*`, `--glass`, `--text-*` CSS variables defined on `:root`
- [ ] Playfair Display + DM Sans + JetBrains Mono fonts loaded from Google Fonts
- [ ] `tailwind.config.js` extended with all Phase 9 color tokens mirroring CSS vars
- [ ] `.glass-card` base class defined in `@layer components`
- [ ] All 12 animation `@keyframes` defined in global CSS
- [ ] `font-family: 'DM Sans', ...` set on `body`

## Tasks

### Task 1: Update index.html with Phase 9 fonts

<read_first>
- index.html
</read_first>

<action>
Replace the existing Google Fonts link (Inter) in `index.html` `<head>` with:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```
Also update the `<title>` to `ResQ AI — Emergency Response Platform`.
</action>

<acceptance_criteria>
- index.html contains `family=Playfair+Display`
- index.html contains `family=DM+Sans`
- index.html contains `family=JetBrains+Mono`
- index.html contains `<title>ResQ AI — Emergency Response Platform</title>`
</acceptance_criteria>

---

### Task 2: Replace src/index.css with Phase 9 design system

<read_first>
- src/index.css
- tailwind.config.js
</read_first>

<action>
Completely replace `src/index.css` content with:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── CSS Custom Properties ─────────────────────────────── */
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

@layer base {
  html { scroll-behavior: auto; } /* Lenis handles smooth scroll */
  body {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    cursor: none; /* Hidden — custom cursor active on desktop */
  }
  @media (hover: none) { body { cursor: auto; } }
  * { box-sizing: border-box; }
  *:focus-visible { outline: 2px solid var(--accent-cyan); outline-offset: 2px; }
}

@layer components {
  /* ── Glass Card ──────────────────────────────────── */
  .glass-card {
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
  }
  .glass-card-elevated {
    background: var(--bg-elevated);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
  }

  /* ── Typography utilities ────────────────────────── */
  .font-playfair { font-family: 'Playfair Display', Georgia, serif; font-style: italic; }
  .font-dm { font-family: 'DM Sans', system-ui, sans-serif; }
  .font-mono-data { font-family: 'JetBrains Mono', 'Courier New', monospace; }
  .label-caps {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .label-caps-gold {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-gold);
  }

  /* ── Severity badges ─────────────────────────────── */
  .badge-critical { background: rgba(255,45,45,0.15); color: var(--accent-red); border: 1px solid rgba(255,45,45,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge-high { background: rgba(255,107,26,0.15); color: var(--accent-orange); border: 1px solid rgba(255,107,26,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge-medium { background: rgba(245,158,11,0.15); color: #F59E0B; border: 1px solid rgba(245,158,11,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge-low { background: rgba(90,106,138,0.15); color: var(--text-muted); border: 1px solid rgba(90,106,138,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge-resolved { background: rgba(0,230,118,0.15); color: var(--accent-green); border: 1px solid rgba(0,230,118,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge-live { background: rgba(0,212,255,0.15); color: var(--accent-cyan); border: 1px solid rgba(0,212,255,0.3); padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; animation: pulse 2s infinite; }

  /* ── Buttons ─────────────────────────────────────── */
  .btn-sos {
    background: var(--accent-red);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 999px;
    border: none;
    cursor: none;
    position: relative;
    box-shadow: 0 0 32px rgba(255, 45, 45, 0.5);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  .btn-sos:hover { box-shadow: 0 0 48px rgba(255, 45, 45, 0.7); transform: scale(1.02); }

  .btn-outline-cyan {
    background: transparent;
    color: var(--accent-cyan);
    border: 1px solid var(--accent-cyan);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    padding: 14px 32px;
    border-radius: 999px;
    cursor: none;
    transition: background 0.3s ease, color 0.3s ease;
  }
  .btn-outline-cyan:hover { background: var(--accent-cyan); color: var(--bg); }

  /* ── Floating SOS Button ─────────────────────────── */
  .floating-sos {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--accent-red);
    border: none;
    cursor: none;
    z-index: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 24px rgba(255,45,45,0.4);
  }
  .floating-sos::before, .floating-sos::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--accent-red);
    animation: sos-ring 2s ease-out infinite;
  }
  .floating-sos::after { animation-delay: 0.6s; }

  /* ── Underline input ─────────────────────────────── */
  .input-underline {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--glass-border);
    border-radius: 0;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    padding: 12px 0;
    width: 100%;
    outline: none;
    transition: border-color 0.3s ease;
  }
  .input-underline:focus { border-bottom-color: var(--accent-cyan); }
  .input-underline::placeholder { color: var(--text-muted); }

  /* ── Marquee wrapper ─────────────────────────────── */
  .marquee-track { display: flex; gap: 64px; width: max-content; }
  .marquee-track-reverse { animation-direction: reverse; }

  /* ── Scrollbar ───────────────────────────────────── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 3px; }
}

@layer utilities {
  .text-gradient-red {
    background: linear-gradient(135deg, #FF2D2D, #FF6B1A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ghost-border { border: 1px solid var(--glass-border); }
  .bg-surface { background-color: var(--bg-surface); }
  .bg-elevated { background-color: var(--bg-elevated); }
  .text-primary { color: var(--text-primary); }
  .text-muted-custom { color: var(--text-muted); }
  .text-dim { color: var(--text-dim); }
  .text-accent-red { color: var(--accent-red); }
  .text-accent-cyan { color: var(--accent-cyan); }
  .text-accent-green { color: var(--accent-green); }
  .text-accent-gold { color: var(--accent-gold); }
}

/* ── Global @keyframes ─────────────────────────────────── */

@keyframes sos-ring {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes marquee-reverse {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes line-draw {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes bounce-dot {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes float-drift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes checkmark-draw {
  from { stroke-dashoffset: 200; }
  to { stroke-dashoffset: 0; }
}

@keyframes donut-draw {
  from { stroke-dasharray: 0 100; }
}

@keyframes step-dashes {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

/* ── Animate helpers ───────────────────────────────────── */
.animate-marquee { animation: marquee 30s linear infinite; }
.animate-marquee:hover { animation-play-state: paused; }
.animate-marquee-reverse { animation: marquee-reverse 30s linear infinite; }
.animate-marquee-reverse:hover { animation-play-state: paused; }
.animate-bounce-dot { animation: bounce-dot 1.5s ease-in-out infinite; }
.animate-float-drift { animation: float-drift 8s ease-in-out infinite; }
.animate-radar { animation: radar-sweep 3s linear infinite; }
.animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
```
</action>

<acceptance_criteria>
- `src/index.css` contains `:root {` with `--bg: #06090F`
- `src/index.css` contains `.glass-card {`
- `src/index.css` contains `@keyframes sos-ring`
- `src/index.css` contains `@keyframes shimmer`
- `src/index.css` contains `@keyframes marquee`
- `src/index.css` contains `.btn-sos {`
- `src/index.css` contains `.floating-sos {`
- `src/index.css` contains `.font-playfair {`
</acceptance_criteria>

---

### Task 3: Extend tailwind.config.js with Phase 9 tokens

<read_first>
- tailwind.config.js
</read_first>

<action>
Replace `tailwind.config.js` content with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#06090F',
        'bg-surface': '#0D1525',
        'bg-elevated': '#141E30',
        'accent-red': '#FF2D2D',
        'accent-orange': '#FF6B1A',
        'accent-cyan': '#00D4FF',
        'accent-green': '#00E676',
        'accent-gold': '#C8A96E',
        'text-primary': '#EEF2FF',
        'text-muted': '#5A6A8A',
        'text-dim': '#2A3A55',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        dm: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        glass: '16px',
      },
      boxShadow: {
        sos: '0 0 32px rgba(255,45,45,0.5)',
        'sos-lg': '0 0 48px rgba(255,45,45,0.7)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 24px 64px rgba(0,0,0,0.5)',
        cyan: '0 0 24px rgba(0,212,255,0.3)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'float-drift': 'float-drift 8s ease-in-out infinite',
        'sos-ring': 'sos-ring 2s ease-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'bounce-dot': 'bounce-dot 1.5s ease-in-out infinite',
        'radar': 'radar-sweep 3s linear infinite',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        'sos-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'float-drift': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'bounce-dot': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
}
```
</action>

<acceptance_criteria>
- `tailwind.config.js` contains `'accent-red': '#FF2D2D'`
- `tailwind.config.js` contains `'bg': '#06090F'`
- `tailwind.config.js` contains `fontFamily:` with `playfair`
- `tailwind.config.js` contains `boxShadow:` with `sos:`
</acceptance_criteria>

## Verification

```bash
# App builds without CSS errors
npm run build 2>&1 | grep -v "^>" | head -20

# Design tokens present
grep -n "var(--bg)" src/index.css | wc -l
grep -n "'Playfair Display'" tailwind.config.js
```
