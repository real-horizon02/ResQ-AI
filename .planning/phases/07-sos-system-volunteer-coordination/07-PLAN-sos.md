-----
plan: 07-sos-logic
phase: 7
wave: 1
depends_on: [05-push-setup]
files_modified:
  - src/components/sos/SOSButton.tsx
  - src/hooks/useSOS.ts
  - supabase/functions/sos-handler/index.ts
requirements_addressed:
  - SOS-01
  - SOS-02
autonomous: true
-----

# Plan 7.1: SOS System Implementation

Build the core SOS signaling infrastructure for high-priority distress alerts.

## Tasks
1. Create `sos_alerts` table (user_id, location, status, battery_level).
2. Build `useSOS` hook to handle GPS tracking and broadcasting.
3. Create `SOSButton` (FAB) with long-press protection.
4. Implement `sos-handler` Edge Function to alert nearby volunteers.
5. Add SOS Alert sound and visual popup to Admin Dashboard.
