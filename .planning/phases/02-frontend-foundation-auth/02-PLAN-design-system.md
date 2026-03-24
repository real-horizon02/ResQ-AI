---
plan: 02-design-system
phase: 2
wave: 1
depends_on: [02-vite-tailwind]
files_modified:
  - src/index.css
  - src/components/layout/Header.tsx
  - src/components/layout/Footer.tsx
  - src/components/ui/Button.tsx
requirements_addressed:
  - FE-02
  - FE-03
autonomous: true
---

# Plan 2.2: Design System + Layout

Build the ResQ AI design system using Tailwind and create the core layout components (Header, Navigation, Footer).

## read_first
- `.planning/phases/02-frontend-foundation-auth/02-RESEARCH.md` — Colors and layout spec.

## Tasks
1. Update `src/index.css` with CSS variables for colors and foundational styles.
2. Build `src/components/ui/Button.tsx` with variants for primary (brand-red), secondary (brand-blue), and outline.
3. Build `src/components/layout/Header.tsx` with logo, navigation links, and mobile menu.
4. Build `src/components/layout/Footer.tsx` with essential links and copyright.
5. Setup `src/App.tsx` with the base layout and routing.
