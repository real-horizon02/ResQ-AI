-----
plan: 03-disaster-markers
phase: 3
wave: 1
depends_on: [03-base-map]
files_modified:
  - src/components/map/DisasterMarkers.tsx
  - src/hooks/useDisasters.ts
requirements_addressed:
  - MAP-04
  - MAP-05
  - MAP-06
autonomous: true
-----

# Plan 3.2: Disaster Markers + Layers

Implement live marker rendering for disasters with Supabase Realtime.

## Tasks
1. Create `useDisasters` hook to fetch `disaster_events` from Supabase with PostGIS geometry.
2. Implement marker icons using Lucide (Color-coded: Red, Orange, Yellow).
3. Setup Supabase Realtime subscription to update the map markers on the fly.
4. Add generic popups for disaster details (severity, type, time).
