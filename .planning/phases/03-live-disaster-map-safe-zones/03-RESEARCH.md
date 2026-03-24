# Phase 3 Research: Live Disaster Map + Safe Zones

The core of ResQ AI is an interactive, real-time map of India showing disasters and safe zones.

## Tech Stack & Configuration

- **Leaflet.js**: Lightweight, mobile-friendly map library.
- **OpenStreetMap (OSM)**: Base map tiles.
- **PostGIS + Supabase Realtime**: Fetching and live-syncing spatial data.
- **Lucide Icons**: Custom markers for different disaster types.

## Map Strategy

### 1. Leaflet Plugins
- `react-leaflet`: React components for Leaflet.
- `leaflet-markercluster`: Performance for high-density safe zones.
- `leaflet-geoman`: For admin-side zone drawing (will be used in Phase 6, but prepared now).

### 2. PostGIS Integration
- ST_AsGeoJSON for frontend consumption.
- ST_DWithin for finding safe zones near the user.

### 3. Realtime Architecture
- Channel: `disaster_events` and `user_reports`.
- Event: `INSERT`, `UPDATE`, `DELETE`.
- Strategy: Refetch only affected markers or append to local state.

## Marker Design System

- **Disasters**: 
  - Flood: Blue icon + Blue polygon.
  - Earthquake: Orange pulsing circle.
  - Landslide: Brown icon.
  - Wildfire: Red flame icon + Red polygon.
- **Safe Zones**:
  - Blue Hospital/Shelter icon.
- **User Reports**:
  - Purple alert icon.
