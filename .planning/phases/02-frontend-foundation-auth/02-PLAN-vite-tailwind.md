---
plan: 02-vite-tailwind
phase: 2
wave: 1
depends_on: []
files_modified:
  - package.json
  - tailwind.config.js
  - src/App.tsx
  - src/index.css
requirements_addressed:
  - FE-01
  - FE-02
autonomous: true
---

# Plan 2.1: Vite + React + Tailwind Scaffold

Initialize the React application with Vite, install core dependencies (Tailwind, Lucide, Framer Motion), and configure the design tokens.

## read_first
- `.planning/phases/02-frontend-foundation-auth/02-RESEARCH.md` — Brand tokens and stack.

## Tasks
1. `npx create-vite@latest ./ --template react-ts` (non-interactive)
2. `npm install -D tailwindcss postcss autoprefixer lucide-react framer-motion zustand react-router-dom`
3. Initialize Tailwind `npx tailwindcss init -p`
4. Update `tailwind.config.js` with ResQ AI brand colors and Inter font.
5. Create standard folder structure: `src/components`, `src/hooks`, `src/pages`, `src/store`.
