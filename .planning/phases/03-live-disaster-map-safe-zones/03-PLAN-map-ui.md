-----
plan: 03-map-ui
phase: 3
wave: 2
depends_on: [03-safe-zones]
files_modified:
  - src/components/map/MapLegend.tsx
  - src/components/map/LayerControl.tsx
requirements_addressed:
  - MAP-07
  - MAP-08
autonomous: true
-----

# Plan 3.4: Map UI + Legend

Final polish for the map with legend, layer toggles, and info panels.

## Tasks
1. Create a floating `MapLegend` component.
2. Implement `LayerControl` to toggle between Disaster, Safe Zone, and User Report layers.
3. Add an "Active Alerts" ticker linked to the map data.
4. Verify mobile responsiveness and touch interactions.
