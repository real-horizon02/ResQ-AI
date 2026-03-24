-----
plan: 03-base-map
phase: 3
wave: 1
depends_on: [02-vite-tailwind]
files_modified:
  - package.json
  - src/pages/Map.tsx
  - src/components/map/MapContainer.tsx
requirements_addressed:
  - MAP-01
  - MAP-02
  - MAP-03
autonomous: true
-----

# Plan 3.1: Base Map Setup

Scaffold the main map view using Leaflet and React-Leaflet.

## Tasks
1. `npm install leaflet react-leaflet lucide-react`
2. Create `src/components/map/MapContainer.tsx` with OSM tiles centered on India.
3. Integrate "Locate Me" button using browser geolocation.
4. Add basic zoom and layer controls.
5. Create `src/pages/Map.tsx` and add to main router.
