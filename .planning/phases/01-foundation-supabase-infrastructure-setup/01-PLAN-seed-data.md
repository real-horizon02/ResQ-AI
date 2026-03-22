---
plan: 01-seed-data
phase: 1
wave: 2
depends_on: [01-database-schema]
files_modified:
  - .planning/phases/01-foundation-supabase-infrastructure-setup/seed.sql (new, reference copy)
requirements_addressed:
  - INFRA-02
autonomous: true
---

# Plan 1.3: Seed Data

## Objective

Seed the database with realistic Indian disaster data: safe zones (hospitals, shelters, rescue stations) for major Indian cities, sample disaster events for different types (flood, earthquake, cyclone), and sample user reports — all with realistic coordinates — so development and testing have real-world-like data to work with.

## read_first

- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Schema table definitions, PostGIS POINT format
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-PLAN-database-schema.md` — Table columns reference

## Tasks

<task id="1.3.1">
<title>Seed safe_zones (hospitals, shelters, rescue stations)</title>
<action>
Run via `mcp_supabase-mcp-server_execute_sql` (not a migration — seed data):

```sql
-- Safe Zones: Major Indian Cities
INSERT INTO safe_zones (name, type, location, address, capacity, current_occupancy, contact_number, amenities, is_active)
VALUES
  -- DELHI
  ('AIIMS Delhi', 'hospital', ST_MakePoint(77.2090, 28.5672)::geography, 'Ansari Nagar East, New Delhi 110029', 2478, 1200, '011-26588500', ARRAY['emergency','icu','blood_bank','pharmacy'], true),
  ('Safdarjung Hospital', 'hospital', ST_MakePoint(77.2076, 28.5706)::geography, 'Ansari Nagar West, New Delhi 110029', 1531, 900, '011-26173012', ARRAY['emergency','surgery','pediatrics'], true),
  ('Delhi Disaster Shelter - Yamuna Sports Complex', 'shelter', ST_MakePoint(77.2487, 28.6258)::geography, 'Yamuna Sports Complex, Delhi Gate, Delhi 110002', 5000, 0, '1077', ARRAY['food','water','electricity','first_aid'], true),
  ('NDRF 3rd Battalion Delhi', 'rescue_station', ST_MakePoint(77.3178, 28.6619)::geography, 'Vasant Kunj, New Delhi', 200, 0, '011-25092001', ARRAY['rescue_equipment','boats','rope_rescue','medical'], true),

  -- MUMBAI
  ('KEM Hospital Mumbai', 'hospital', ST_MakePoint(72.8453, 18.9967)::geography, 'Acharya Donde Marg, Parel, Mumbai 400012', 1800, 950, '022-24136051', ARRAY['emergency','trauma','icu','blood_bank'], true),
  ('NSCI Dome Shelter Mumbai', 'shelter', ST_MakePoint(72.8478, 19.0177)::geography, 'NSCI, Dr Annie Besant Road, Worli, Mumbai 400018', 3000, 0, '1916', ARRAY['food','water','blankets','first_aid'], true),
  ('NDRF 4th Battalion Pune', 'rescue_station', ST_MakePoint(73.8567, 18.5204)::geography, 'Dighi, Pune 411015', 180, 0, '020-27650152', ARRAY['flood_rescue','boats','medical','communication'], true),

  -- CHENNAI
  ('Government General Hospital Chennai', 'hospital', ST_MakePoint(80.2785, 13.0843)::geography, 'Park Town, Chennai 600003', 2600, 1400, '044-25305000', ARRAY['emergency','icu','burn_unit','blood_bank'], true),
  ('Jawaharlal Nehru Indoor Stadium Shelter', 'shelter', ST_MakePoint(80.2593, 13.0712)::geography, 'Jawaharlal Nehru Salai, Chennai 600014', 4000, 0, '044-22350000', ARRAY['food','water','electricity','sanitation'], true),
  ('NDRF 6th Battalion Chennai', 'rescue_station', ST_MakePoint(80.2707, 13.0827)::geography, 'Aranganathan Nagar, Chennai', 200, 0, '044-25360001', ARRAY['cyclone_rescue','boats','flood_rescue','medical'], true),

  -- KOLKATA
  ('SSKM Hospital Kolkata', 'hospital', ST_MakePoint(88.3462, 22.5385)::geography, 'A J C Bose Road, Kolkata 700020', 2000, 1100, '033-22043220', ARRAY['emergency','icu','trauma','pharmacy'], true),
  ('Salt Lake Stadium Shelter', 'shelter', ST_MakePoint(88.3997, 22.5748)::geography, 'Salt Lake, Kolkata 700098', 6000, 0, '1070', ARRAY['food','water','electricity','flood_blankets'], true),

  -- BHUBANESWAR / ODISHA (cyclone prone)
  ('AIIMS Bhubaneswar', 'hospital', ST_MakePoint(85.8245, 20.2961)::geography, 'Sijua, Bhubaneswar 751019', 850, 400, '0674-2476789', ARRAY['emergency','cyclone_trauma','icu'], true),
  ('Cuttack Central Cyclone Shelter', 'shelter', ST_MakePoint(85.8830, 20.4625)::geography, 'CDA, Cuttack 753014', 8000, 0, '1070', ARRAY['cyclone_rated','food','water','generator'], true),
  ('ODRAF Headquarters Bhubaneswar', 'rescue_station', ST_MakePoint(85.8314, 20.2961)::geography, 'Bhubaneswar 751001', 300, 0, '0674-2534177', ARRAY['cyclone_rescue','boats','chainsaw','medical'], true),

  -- KERALA (flood prone)
  ('Thrissur Medical College Hospital', 'hospital', ST_MakePoint(76.2144, 10.5276)::geography, 'Marayamuttom, Thrissur 680596', 750, 380, '0487-2201900', ARRAY['emergency','flood_trauma','icu'], true),
  ('KSRTC Bus Terminal Shelter Ernakulam', 'shelter', ST_MakePoint(76.2673, 9.9948)::geography, 'High Court Junction, Ernakulam', 2000, 0, '0484-2361185', ARRAY['food','water','boats_nearby'], true),

  -- DEHRADUN / UTTARAKHAND (landslide prone)
  ('Doon Hospital Dehradun', 'hospital', ST_MakePoint(78.0322, 30.3165)::geography, 'Shubhash Nagar, Dehradun 248001', 500, 250, '0135-2714225', ARRAY['emergency','landslide_trauma','orthopedic'], true),
  ('SDRF Base Camp Dehradun', 'rescue_station', ST_MakePoint(78.0419, 30.3255)::geography, 'Police Lines, Dehradun', 150, 0, '0135-2710610', ARRAY['landslide_rescue','rope_rescue','helicopter_coordination','medical'], true);
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-PLAN-database-schema.md` — safe_zones table schema
</read_first>
<acceptance_criteria>
- SQL executes without error
- `SELECT COUNT(*) FROM safe_zones;` returns at least 15
- `SELECT COUNT(*) FROM safe_zones WHERE type = 'hospital';` returns at least 5
- `SELECT COUNT(*) FROM safe_zones WHERE type = 'rescue_station';` returns at least 3
- `SELECT * FROM get_safe_zones_nearby(28.5672, 77.2090, 20000);` returns at least 2 rows (Delhi safe zones)
</acceptance_criteria>
</task>

<task id="1.3.2">
<title>Seed disaster_events (active sample disasters)</title>
<action>
Run via `mcp_supabase-mcp-server_execute_sql`:

```sql
-- Sample Disaster Events for Development
INSERT INTO disaster_events (name, description, type, severity, status, source, confidence_pct, epicenter, affected_radius_km, start_time)
VALUES
  -- Active Flood in Bihar
  (
    'Gandak River Flooding - West Champaran',
    'Heavy monsoon rainfall causing Gandak river to overflow. Villages in West Champaran district affected. Water level 2.5m above danger mark.',
    'flood', 'critical', 'active', 'official_warning', 100,
    ST_MakePoint(84.5013, 26.8894)::geography,
    45, NOW() - INTERVAL '6 hours'
  ),

  -- Active Cyclone Warning - Bay of Bengal
  (
    'Cyclone Asani Alert - Odisha Coast',
    'Deep depression in Bay of Bengal intensifying into cyclone. Landfall expected near Puri in 18-24 hours. Wind speed: 120kmph gusts.',
    'cyclone', 'high', 'active', 'official_warning', 100,
    ST_MakePoint(85.9012, 19.8134)::geography,
    200, NOW() - INTERVAL '2 hours'
  ),

  -- Earthquake alert - Sikkim
  (
    'Magnitude 5.8 Earthquake - Sikkim',
    'Moderate earthquake recorded near Gangtok. Depth: 10km. Aftershocks possible in next 24 hours. Structural damage reported in Mangan.',
    'earthquake', 'high', 'active', 'usgs', 100,
    ST_MakePoint(88.6138, 27.3389)::geography,
    80, NOW() - INTERVAL '1 hour'
  ),

  -- AI Predicted Landslide - Uttarakhand
  (
    'Landslide Risk - NH-7 Chamoli District',
    'AI prediction: Heavy rainfall (>200mm in 48hrs) combined with saturated soil conditions creates 87% landslide probability on NH-7 near Chamoli.',
    'landslide', 'high', 'active', 'ai_prediction', 87,
    ST_MakePoint(79.3219, 30.4024)::geography,
    15, NOW() - INTERVAL '30 minutes'
  ),

  -- Heavy Rainfall Warning - Mumbai
  (
    'Heavy Rainfall Alert - Mumbai Metropolitan Region',
    'IMD orange alert for extremely heavy rainfall in Mumbai, Thane, Palghar. Waterlogging expected in low-lying areas.',
    'rainfall', 'medium', 'active', 'imb', 95,
    ST_MakePoint(72.8777, 19.0760)::geography,
    60, NOW() - INTERVAL '3 hours'
  ),

  -- Historical: Kerala Floods 2018
  (
    'Kerala Floods 2018 - Historical Record',
    'The worst flooding in Kerala in nearly a century. 14 out of 14 districts severely affected. Over 400 deaths, 1 million displaced.',
    'flood', 'critical', 'resolved', 'historical', 100,
    ST_MakePoint(76.2711, 10.8505)::geography,
    250, '2018-08-08 00:00:00+05:30'
  );
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-PLAN-database-schema.md` — disaster_events schema
</read_first>
<acceptance_criteria>
- SQL executes without error
- `SELECT COUNT(*) FROM disaster_events;` returns 6
- `SELECT COUNT(*) FROM disaster_events WHERE status = 'active';` returns 5
- `SELECT COUNT(*) FROM disaster_events WHERE source = 'ai_prediction';` returns 1
- `SELECT * FROM get_events_near(28.6139, 77.2090, 500000);` executes without error
</acceptance_criteria>
</task>

<task id="1.3.3">
<title>Seed user_reports (sample community reports)</title>
<action>
Run via `mcp_supabase-mcp-server_execute_sql`:

```sql
-- Sample User Reports (no user_id — anonymous seed data)
INSERT INTO user_reports (type, description, location, severity, status, verification_count)
VALUES
  ('flood', 'Waterlogging on MG Road, knee-deep water near Rajiv Chowk Metro. Traffic completely blocked.', ST_MakePoint(77.2196, 28.6328)::geography, 'medium', 'community_verified', 12),
  ('road_closed', 'NH-58 completely blocked by landslide near Devprayag. Debris on road blocking all traffic.', ST_MakePoint(78.5974, 30.1456)::geography, 'high', 'admin_verified', 25),
  ('water_logged', 'Basement flooding at Silk Board Junction Bengaluru. Water entered ground floor shops.', ST_MakePoint(77.6230, 12.9165)::geography, 'medium', 'community_verified', 8),
  ('flood', 'Yamuna floodplain in Mayur Vihar submerged. Residents evacuating to higher ground.', ST_MakePoint(77.2899, 28.6069)::geography, 'high', 'admin_verified', 35),
  ('other', 'Power outage throughout Sector 14 Gurgaon due to flooding in transformer room. No ETA from DHBVN.', ST_MakePoint(77.0266, 28.4595)::geography, 'low', 'pending', 2);
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-PLAN-database-schema.md` — user_reports schema
</read_first>
<acceptance_criteria>
- SQL executes without error
- `SELECT COUNT(*) FROM user_reports;` returns 5
- `SELECT COUNT(*) FROM user_reports WHERE status = 'admin_verified';` returns 2
- `SELECT COUNT(*) FROM user_reports WHERE status = 'pending';` returns 1
</acceptance_criteria>
</task>

<task id="1.3.4">
<title>Save seed data reference file</title>
<action>
Create `.planning/phases/01-foundation-supabase-infrastructure-setup/seed.sql` as a reference copy containing all 3 INSERT blocks from tasks 1.3.1, 1.3.2, and 1.3.3, with section headers:

```sql
-- ResQ AI: Development Seed Data
-- Run these in sequence AFTER schema migrations are applied
-- Last updated: 2026-03-22

-- ================================================================
-- SECTION 1: Safe Zones
-- ================================================================
[full safe_zones INSERT from task 1.3.1]

-- ================================================================
-- SECTION 2: Disaster Events (Sample)
-- ================================================================
[full disaster_events INSERT from task 1.3.2]

-- ================================================================
-- SECTION 3: User Reports (Sample)
-- ================================================================
[full user_reports INSERT from task 1.3.3]
```
</action>
<read_first>
- This plan's tasks 1.3.1, 1.3.2, 1.3.3 for the SQL content
</read_first>
<acceptance_criteria>
- `e:\ResQ AI\.planning\phases\01-foundation-supabase-infrastructure-setup\seed.sql` exists
- File contains `INSERT INTO safe_zones`
- File contains `INSERT INTO disaster_events`
- File contains `INSERT INTO user_reports`
</acceptance_criteria>
</task>

## Verification

```sql
-- Run these via mcp_supabase-mcp-server_execute_sql:

-- 1. Safe zone counts by type
SELECT type, COUNT(*) FROM safe_zones GROUP BY type ORDER BY type;
-- Expected: hospital ~6, shelter ~5, rescue_station ~4

-- 2. Nearest safe zones query works
SELECT name, type, ROUND(distance_m::numeric) as distance_m
FROM get_safe_zones_nearby(28.5672, 77.2090, 30000);
-- Expected: returns AIIMS Delhi and Safdarjung Hospital

-- 3. Active disaster events
SELECT name, type, severity FROM disaster_events WHERE status = 'active' ORDER BY severity;
-- Expected: 5 active events

-- 4. Community verified reports
SELECT type, status, verification_count FROM user_reports ORDER BY verification_count DESC;
-- Expected: 5 reports with various statuses
```

## must_haves

- At least 15 safe zones seeded across 6+ Indian cities/states
- At least 5 active disaster events of different types (flood, cyclone, earthquake, landslide, rainfall)
- At least 5 user reports with different statuses
- `get_safe_zones_nearby(28.5672, 77.2090, 30000)` returns real Delhi hospitals
- `seed.sql` reference file saved in phase directory
