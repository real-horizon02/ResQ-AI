# ResQ AI: Architecture Research

## 1. System Component Map

```
[React PWA / Vercel]
       ↕ REST + WebSocket
[Supabase BaaS]
  ├── PostgreSQL + PostGIS (spatial data)
  ├── Realtime (WebSocket broadcasts)
  ├── Auth (OTP + magic link)
  ├── Storage (incident photos/videos)
  └── Edge Functions (alert triggers, webhooks)
       ↕ REST API
[FastAPI ML Microservice / Railway]
  ├── Flood prediction (XGBoost)
  ├── Rainfall time-series (Prophet)
  ├── Report image classification (CNN)
  └── Geospatial processing (GeoPandas)

[Ingestion Workers - FastAPI scheduled tasks]
  ├── USGS Earthquake API (poll every 5 min)
  ├── OpenWeatherMap API (poll every 15 min)
  ├── IMD RSS feeds (poll every 30 min)
  └── INCOIS Tsunami bulletins (poll every 10 min)

[Twilio - Communications]
  ├── WhatsApp Business API (primary alerts)
  └── SMS API (fallback)

[External Map Tiles]
  └── OpenStreetMap tile servers
```

## 2. Data Flow Diagrams

### Disaster Alert Pipeline (Inbound)
```
External APIs (USGS/IMD) → Ingestion Worker → Supabase DB (disaster_events)
→ Database Trigger → Alert Worker (Edge Function)
→ Twilio (SMS/WhatsApp to users in radius)
→ Supabase Realtime (browser push to connected PWA users)
```

### Citizen Report Verification (Outbound)
```
Citizen Submit (PWA) → Supabase Storage (photos) + DB (pending reports)
→ FastAPI ML (AI content filter: is this actually a disaster?)
→ Nearby high-reputation users (community verify - 5 confirmations)
→ Admin/Moderator (final check for promoted alerts)
→ Supabase Realtime broadcast (purple → orange → red upgrade)
```

### SOS Flow
```
User taps SOS → GPS captured → Supabase DB (sos_requests)
→ Edge Function → Notify NDRF + nearby volunteers within 10km
→ Supabase Realtime → SOS appears on map for responders
→ Regular location pings until resolved
```

## 3. Key Database Tables

| Table | Key Columns |
|-------|------------|
| `profiles` | id, user_id, location (geometry), reputation_score, notification_prefs |
| `disaster_events` | id, type, severity, source, location (geometry), active, timestamp |
| `user_reports` | id, user_id, event_id, description, media_urls, location (geometry), status, verifications |
| `sos_requests` | id, user_id, emergency_type, location (geometry), status, responder_id, resolved_at |
| `safe_zones` | id, type (hospital/shelter/camp), name, location (geometry), capacity, current_occupancy |
| `notifications` | id, event_id, recipient_id, channel, sent_at, status |
| `volunteers` | id, user_id, skills, resources, is_verified, location (geometry), available |

## 4. Spatial Query Patterns

```sql
-- Users in disaster radius (for notifications)
SELECT id, phone FROM profiles
WHERE ST_DWithin(location::geography, ST_MakePoint(lon, lat)::geography, 50000);
-- 50000 meters = 50km

-- Nearest safe zones
SELECT *, ST_Distance(location::geography, ST_MakePoint(lon, lat)::geography) AS distance
FROM safe_zones
WHERE ST_DWithin(location::geography, ST_MakePoint(lon, lat)::geography, 20000)
ORDER BY distance LIMIT 5;
```

## 5. Build Order

1. **Phase 1** — Supabase setup + PostGIS schema + Auth + Basic Leaflet Map + Manual Data
2. **Phase 2** — Frontend UI: Map, Dashboard, Alerts page, Safe Zones directory
3. **Phase 3** — Ingestion workers (USGS, OWM, IMD) + Realtime map updates
4. **Phase 4** — Twilio notifications (WhatsApp + SMS) with spatial targeting
5. **Phase 5** — Citizen reporting + Community verification pipeline
6. **Phase 6** — SOS system + Volunteer coordination
7. **Phase 7** — FastAPI ML microservice + AI prediction integration
8. **Phase 8** — PWA offline optimization + Service workers + Background sync

## 6. API Integration Pattern

Use **Adapter Pattern** in ingestion layer to normalize diverse sources:
- USGS: GeoJSON → internal schema
- IMD: RSS/XML → internal schema
- INCOIS: HTML bulletins → internal schema
- OWM: JSON REST → internal schema

Cache all external data with TTLs:
- Earthquake: 5 min
- Rainfall: 15 min
- Flood prediction: 30 min
- Safe zones: 24 hours
