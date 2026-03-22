# ResQ AI: Research Summary

## Recommended Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v3 + Framer Motion (SPA, better than Next.js for this real-time dashboard)
- **Maps:** Leaflet.js + OpenStreetMap + plugins: `leaflet.heat`, `Leaflet.markercluster`, `Leaflet-Geoman`, `Leaflet Routing Machine`
- **Backend:** Supabase (PostgreSQL + PostGIS + Realtime + Auth + Storage + Edge Functions)
- **ML Service:** FastAPI + Docker on Railway/Render (NOT Vercel — cold start + GDAL issues)
- **ML Libraries:** XGBoost/LightGBM (flood prediction), Prophet (time-series), GeoPandas (spatial), scikit-learn
- **Notifications:** Twilio WhatsApp Business API (primary) + SMS fallback + Web Push PWA
- **Deployment:** Vercel (frontend), Railway/Render (ML microservice)

## Table Stakes Features

Real-time CAP alerts, live Leaflet disaster map, SOS button, shelter/resource directory, multilingual (EN/HI/Hinglish), offline safety guides, community verification for reports.

## Watch Out For

1. **⚠️ CRITICAL: Stale offline PWA evacuation data** — Aggressive TTLs (5 min) + force service worker updates on new alerts
2. **ML class imbalance** — SMOTE + regional models + weight recent data for climate drift
3. **Twilio rate limits** — Pre-register templates with Meta, async message queue before monsoon season
4. **DB connection exhaustion** — Enable Supabase PgBouncer, build Lite Mode UI for traffic spikes
5. **Crowdsourced misinformation** — Reputation system + distance-based verification
6. **Privacy exposure** — Fuzz SOS locations to 100m radius on public map; Supabase RLS for full PII
7. **External API downtime** — Stale-while-revalidate + multi-source fallback chain (IMD → OWM → cache)
8. **Map performance** — Use `Leaflet.markercluster`; distinct icons+shapes not just colors (a11y)

## Build Order

1. Supabase setup + PostGIS schema + Auth
2. Frontend UI (Map, Dashboard, Alerts, Safe Zones)
3. Ingestion workers (USGS, OWM, IMD) + Realtime map updates
4. Twilio notifications with spatial targeting
5. Citizen reporting + community verification pipeline
6. SOS system + volunteer coordination
7. FastAPI ML microservice + AI predictions
8. PWA offline optimization + service workers
