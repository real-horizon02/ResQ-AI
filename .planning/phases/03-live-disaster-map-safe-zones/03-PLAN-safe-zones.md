-----
plan: 03-safe-zones
phase: 3
wave: 2
depends_on: [03-disaster-markers]
files_modified:
  - src/components/map/SafeZoneMarkers.tsx
  - src/hooks/useSafeZones.ts
requirements_addressed:
  - SAFE-01
  - SAFE-02
  - SAFE-03
autonomous: true
-----

# Plan 3.3: Safe Zone Overlays

Display safe zones (hospitals, shelters) on the map with clustering.

## Tasks
1. Create `useSafeZones` hook to fetch `safe_zones` data.
2. Implement Marker Clustering for safe zones to handle high density in cities.
3. Add detail panels for safe zones in popups (capacity, contact info).
4. Implement a "Find Nearest Safe Zone" utility.
