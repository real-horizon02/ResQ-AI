-----
plan: 04-usgs-poller
phase: 4
wave: 1
depends_on: [01-supabase-init]
files_modified:
  - supabase/functions/usgs-ingestion/index.ts
requirements_addressed:
  - DATA-01
  - DATA-02
autonomous: true
-----

# Plan 4.1: USGS Earthquake Poller

Implement a Supabase Edge Function to poll the USGS earthquake feed and update our database.

## Tasks
1. Create Edge Function `usgs-ingestion`.
2. Implement fetch from USGS GeoJSON (1-hour summary).
3. Filter events for significant earthquakes near/in India region (or all global significant ones).
4. Map GeoJSON properties to `disaster_events` table.
5. Use `upsert` with `source_id` to prevent duplicates.
