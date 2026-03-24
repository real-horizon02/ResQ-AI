-----
plan: 08-pwa-offline
phase: 8
wave: 1
depends_on: [06-reporting]
files_modified:
  - vite.config.ts
  - src/lib/supabase.ts
  - src/components/reports/ReportForm.tsx
requirements_addressed:
  - PWA-01
  - PWA-02
autonomous: true
-----

# Plan 8.1: PWA Offline Sync Implementation

## Tasks
1. Configuration of PWA plugin for Vite.
2. Implement `Outbox` logic in `src/lib/outbox.ts`.
3. Modify `ReportForm` to use Outbox if offline.
4. Add auto-sync on browser `online` event.
