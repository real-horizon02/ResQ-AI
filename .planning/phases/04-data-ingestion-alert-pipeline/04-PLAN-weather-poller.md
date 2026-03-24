-----
plan: 04-weather-poller
phase: 4
wave: 1
depends_on: [01-supabase-init]
files_modified:
  - supabase/functions/weather-alerts/index.ts
requirements_addressed:
  - DATA-03
  - DATA-04
autonomous: true
-----

# Plan 4.2: Weather Alert Poller

Implement an Edge Function to ingest weather alerts from OpenWeatherMap.

## Tasks
1. Create Edge Function `weather-ingestion`.
2. Securely store OWM API Key in Supabase Secrets.
3. Fetch active alerts for major Indian cities.
4. Normalize storm/rainfall/flood alerts to `disaster_events`.
5. Implement error handling and rate limit awareness.
