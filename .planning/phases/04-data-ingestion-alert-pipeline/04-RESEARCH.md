# Phase 4 Research: Data Ingestion + Real-Time Alerts

To provide a real-time monitor, ResQ AI must ingest data from multiple authoritative sources.

## Core Data Sources

1. **USGS Earthquake API**:
   - Source: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
   - Data type: Real-time earthquakes (magnitude, depth, location).
   - Frequency: Every 5-15 mins.

2. **OpenWeatherMap (OWM)**:
   - Source: OWM Weather & One Call API.
   - Data type: Severe weather alerts, heavy rainfall, storms.
   - Frequency: Real-time alerts as they are issued.

3. **IMD (India Meteorological Department)** - Potential:
   - IMD provides RSS feeds or API for rainfall/cyclones in India.

## Ingestion Strategy: Supabase Edge Functions

We will use Supabase Edge Functions (Deno) as lightweight cron jobs or triggers to fetch and normalize data.

### Deduplication
- Use `source_id` (e.g., USGS event ID) and `source_type`.
- Spatial matching to ensure we don't create multiple events for the same incident reported by different sources.

### Normalization
All external data must be mapped to the `disaster_events` schema:
- `type`: mapped to enum.
- `severity`: mapped (e.g., Magnitude 7+ is 'critical').
- `location`: converted to PostGIS Geometry (Point).

## Real-time Flow
1. Edge Function fetches data -> Normlalizes.
2. Upsert into `disaster_events`.
3. Supabase Realtime broadcast (already implemented in Phase 3) -> Frontend Map automatically updates.
