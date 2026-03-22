# ResQ AI: Tech Stack Research (2025)

## Frontend

**React 18 + Vite** — Best choice for this real-time dashboard. Next.js SSR overhead not needed for a SPA; Vite's `vite-plugin-pwa` is the easiest path to offline PWA alerts.
- Do NOT use: Next.js (SSR overhead unnecessary), CRA (slow builds), Webpack

## Map Stack

**Leaflet.js + OpenStreetMap** — Free, open-source, excellent plugin ecosystem.

Key plugins:
- `leaflet.heat` — Disaster intensity heatmaps
- `Leaflet.markercluster` — Handle 10,000+ markers without performance lag
- `Leaflet-Geoman` — Zone drawing for admin (more maintained than leaflet.draw)
- `Leaflet Routing Machine` — Evacuation route calculation

## Backend: Supabase (PostgreSQL + PostGIS)

PostGIS spatial patterns:
- `ST_DWithin(geom, user_location, distance_meters)` — Find resources within X km
- `ST_Distance(geom1, geom2)` — Proximity distance calculation
- Expose via PostgreSQL RPC functions for optimal performance
- Index: GIST index on all geography/geometry columns

## ML Microservice

**FastAPI + Docker** deployed on **Railway or Render** (NOT Vercel).
- Vercel Python serverless: cold start + can't install GDAL/GEOS (required by geopandas)
- Railway/Render: persistent instances, proper ML library support

Best ML libraries (2025):
- **XGBoost / LightGBM** — Gold standard for rainfall-to-flood binary classification
- **Prophet** — Time-series forecasting for rainfall trends
- **GeoPandas + Shapely** — Server-side geospatial operations
- **scikit-learn** — General purpose features, pipelines

## Notifications

- **Twilio WhatsApp Business API** — Primary (rich media, location sharing, template messages)
- **Twilio SMS** — Fallback (works on feature phones, 2G)
- **Web Push API + Service Workers** — Browser push for PWA users
- Twilio is more reliable than SMS in low-connectivity areas via public WiFi networks

## Summary Table

| Category | Tool | Confidence |
|----------|------|-----------|
| Frontend | React 18 + Vite | High |
| Styling | Tailwind CSS v3.4+ | High |
| State | Zustand v4+ | High |
| Maps | Leaflet + OSM | High |
| Database | Supabase + PostGIS | High |
| ML Engine | FastAPI Python 3.12+ | High |
| Deployment | Vercel (FE), Railway (ML) | Medium |
| Notifications | Twilio WhatsApp + SMS | High |
