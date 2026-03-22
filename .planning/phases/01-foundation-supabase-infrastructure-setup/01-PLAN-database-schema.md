---
plan: 01-database-schema
phase: 1
wave: 1
depends_on: [01-supabase-init]
files_modified:
  - .planning/phases/01-foundation-supabase-infrastructure-setup/schema.sql (new, reference copy)
requirements_addressed:
  - INFRA-02
  - INFRA-05
  - INFRA-06
autonomous: true
---

# Plan 1.2: Database Schema

## Objective

Create all 7 core tables with PostGIS spatial columns, enable RLS with appropriate policies on each table, create GIST spatial indexes and B-tree indexes, add stored spatial query functions (`get_safe_zones_nearby`, `get_users_in_radius`), and set up the auth trigger to auto-create a profile on user sign-up.

## read_first

- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Full schema SQL, all RLS policies, spatial functions, auth trigger

## Tasks

<task id="1.2.1">
<title>Create core tables migration</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `create_core_tables`:

```sql
-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT UNIQUE,
  is_verified_responder BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  location GEOGRAPHY(POINT, 4326),
  notification_prefs JSONB DEFAULT '{"flood":true,"earthquake":true,"cyclone":true,"landslide":true,"rainfall":true,"tsunami":true}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISASTER EVENTS TABLE
CREATE TABLE disaster_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('flood','earthquake','cyclone','landslide','rainfall','tsunami','wildfire','other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','contained','resolved')),
  source TEXT DEFAULT 'ai_prediction' CHECK (source IN ('official_warning','usgs','imb','incois','nasa_firms','openweathermap','ai_prediction','historical','simulated')),
  confidence_pct INTEGER,
  epicenter GEOGRAPHY(POINT, 4326),
  affected_area GEOGRAPHY(POLYGON, 4326),
  affected_radius_km INTEGER,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  external_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER REPORTS TABLE
CREATE TABLE user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  disaster_id UUID REFERENCES disaster_events(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('flood','earthquake','landslide','rainfall','cyclone','fire','road_closed','water_logged','other')),
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','community_verified','admin_verified','rejected','spam')),
  verification_count INTEGER DEFAULT 0,
  spam_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOS REQUESTS TABLE
CREATE TABLE sos_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('trapped','medical','evacuation','supply','missing_person','other')),
  description TEXT,
  family_size INTEGER DEFAULT 1,
  medical_emergency BOOLEAN DEFAULT false,
  floor_level INTEGER,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','assigned','resolved','cancelled')),
  responder_id UUID REFERENCES profiles(id),
  eta_minutes INTEGER,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SAFE ZONES TABLE
CREATE TABLE safe_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital','shelter','rescue_station','relief_camp')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  contact_number TEXT,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOLUNTEERS TABLE
CREATE TABLE volunteers (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  skills TEXT[] DEFAULT '{}',
  resources TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  availability_status TEXT DEFAULT 'offline' CHECK (availability_status IN ('available','deployed','offline')),
  last_known_location GEOGRAPHY(POINT, 4326),
  mission_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES disaster_events(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','push','email')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','delivered')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Schema section 2
</read_first>
<acceptance_criteria>
- Migration applies without error
- `mcp_supabase-mcp-server_list_tables` returns tables: profiles, disaster_events, user_reports, sos_requests, safe_zones, volunteers, notifications
- `SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'disaster_events' AND column_name = 'epicenter';` returns udt_name = 'geography'
</acceptance_criteria>
</task>

<task id="1.2.2">
<title>Create spatial indexes and B-tree indexes</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `create_indexes`:

```sql
-- GIST Spatial Indexes (required for ST_DWithin to be fast)
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_disaster_epicenter ON disaster_events USING GIST (epicenter);
CREATE INDEX idx_disaster_affected_area ON disaster_events USING GIST (affected_area);
CREATE INDEX idx_user_reports_location ON user_reports USING GIST (location);
CREATE INDEX idx_sos_requests_location ON sos_requests USING GIST (location);
CREATE INDEX idx_safe_zones_location ON safe_zones USING GIST (location);
CREATE INDEX idx_volunteers_location ON volunteers USING GIST (last_known_location);

-- B-Tree indexes for common filter queries
CREATE INDEX idx_disaster_events_type ON disaster_events (type);
CREATE INDEX idx_disaster_events_status ON disaster_events (status);
CREATE INDEX idx_disaster_events_source ON disaster_events (source);
CREATE INDEX idx_disaster_events_start_time ON disaster_events (start_time DESC);
CREATE INDEX idx_user_reports_status ON user_reports (status);
CREATE INDEX idx_user_reports_user_id ON user_reports (user_id);
CREATE INDEX idx_sos_requests_status ON sos_requests (status);
CREATE INDEX idx_safe_zones_type ON safe_zones (type);
CREATE INDEX idx_safe_zones_is_active ON safe_zones (is_active);
CREATE INDEX idx_volunteers_verified ON volunteers (is_verified);
CREATE INDEX idx_volunteers_availability ON volunteers (availability_status);
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Indexes section
</read_first>
<acceptance_criteria>
- Migration applies without error
- `SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%_location%';` returns at least 5 rows (one per spatial table)
- `SELECT indexname FROM pg_indexes WHERE tablename = 'disaster_events';` includes idx_disaster_epicenter, idx_disaster_events_type, idx_disaster_events_status
</acceptance_criteria>
</task>

<task id="1.2.3">
<title>Enable RLS and create policies on all tables</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `create_rls_policies`:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- DISASTER EVENTS policies (public read; writes via service_role only)
CREATE POLICY "events_public_read" ON disaster_events FOR SELECT USING (true);

-- USER REPORTS policies
CREATE POLICY "reports_authenticated_insert" ON user_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "reports_verified_or_own_read" ON user_reports
  FOR SELECT USING (status IN ('community_verified','admin_verified') OR auth.uid() = user_id);
CREATE POLICY "reports_own_update" ON user_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- SOS REQUESTS policies
CREATE POLICY "sos_authenticated_insert" ON sos_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "sos_own_or_responder_read" ON sos_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT is_verified_responder FROM profiles WHERE id = auth.uid())
  );
CREATE POLICY "sos_responder_update" ON sos_requests
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT is_verified_responder FROM profiles WHERE id = auth.uid())
  );

-- SAFE ZONES policies (public read only)
CREATE POLICY "safe_zones_public_read" ON safe_zones FOR SELECT USING (true);

-- VOLUNTEERS policies
CREATE POLICY "volunteers_public_read" ON volunteers FOR SELECT USING (true);
CREATE POLICY "volunteers_own_insert" ON volunteers
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "volunteers_own_update" ON volunteers
  FOR UPDATE USING (auth.uid() = id);

-- NOTIFICATIONS policies (own read only)
CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — RLS section 3
</read_first>
<acceptance_criteria>
- Migration applies without error
- `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;` shows rowsecurity = true for all 7 tables
- `SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;` returns at least 12 policies
</acceptance_criteria>
</task>

<task id="1.2.4">
<title>Create spatial RPC functions</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `create_spatial_functions`:

```sql
-- Find nearest safe zones within radius
CREATE OR REPLACE FUNCTION get_safe_zones_nearby(
  user_lat FLOAT,
  user_lon FLOAT,
  radius_meters FLOAT DEFAULT 20000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  address TEXT,
  capacity INTEGER,
  current_occupancy INTEGER,
  contact_number TEXT,
  distance_m FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sz.id, sz.name, sz.type, sz.address, sz.capacity,
    sz.current_occupancy, sz.contact_number,
    ST_Distance(sz.location::geography, ST_MakePoint(user_lon, user_lat)::geography) AS distance_m
  FROM safe_zones sz
  WHERE sz.is_active = true
    AND ST_DWithin(sz.location::geography, ST_MakePoint(user_lon, user_lat)::geography, radius_meters)
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find all users in a radius (for notifications)
CREATE OR REPLACE FUNCTION get_users_in_radius(
  center_lat FLOAT,
  center_lon FLOAT,
  radius_meters FLOAT
)
RETURNS TABLE (id UUID, phone_number TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.phone_number FROM profiles p
  WHERE p.location IS NOT NULL
    AND ST_DWithin(p.location::geography, ST_MakePoint(center_lon, center_lat)::geography, radius_meters);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find active disaster events near a location
CREATE OR REPLACE FUNCTION get_events_near(
  user_lat FLOAT,
  user_lon FLOAT,
  radius_meters FLOAT DEFAULT 100000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  severity TEXT,
  source TEXT,
  distance_m FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id, de.name, de.type, de.severity, de.source,
    ST_Distance(de.epicenter::geography, ST_MakePoint(user_lon, user_lat)::geography) AS distance_m
  FROM disaster_events de
  WHERE de.status = 'active'
    AND de.epicenter IS NOT NULL
    AND ST_DWithin(de.epicenter::geography, ST_MakePoint(user_lon, user_lat)::geography, radius_meters)
  ORDER BY de.severity DESC, distance_m ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Spatial RPC section
</read_first>
<acceptance_criteria>
- Migration applies without error
- `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('get_safe_zones_nearby','get_users_in_radius','get_events_near');` returns 3 rows
- `SELECT * FROM get_safe_zones_nearby(28.6139, 77.2090, 10000);` executes without error (returns 0 rows — no seed data yet)
</acceptance_criteria>
</task>

<task id="1.2.5">
<title>Create auth trigger for auto-profile creation</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `create_auth_trigger`:

```sql
-- Function: auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone_number)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.phone
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after every new user inserted in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Auth trigger section
</read_first>
<acceptance_criteria>
- Migration applies without error
- `SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';` returns 1 row
- `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';` returns 1 row
</acceptance_criteria>
</task>

<task id="1.2.6">
<title>Enable Realtime for core tables</title>
<action>
Run via `mcp_supabase-mcp-server_apply_migration` with name `enable_realtime`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE disaster_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE sos_requests;
```
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — Realtime section
</read_first>
<acceptance_criteria>
- Migration applies without error
- `SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename IN ('disaster_events','user_reports','sos_requests');` returns exactly 3 rows
</acceptance_criteria>
</task>

<task id="1.2.7">
<title>Save schema reference copy</title>
<action>
Create `.planning/phases/01-foundation-supabase-infrastructure-setup/schema.sql` as a reference copy of the complete schema — copy the full SQL from the RESEARCH.md file into a standalone .sql file for future reference. This is NOT applied via MCP (migrations above already apply it); it is just a reference copy for developers.

The file should include a header comment:
```sql
-- ResQ AI Database Schema Reference
-- This file is a reference copy. The actual schema is applied via Supabase migrations.
-- Last updated: 2026-03-22
```
Then include the full CREATE TABLE statements, indexes, functions, and trigger from the research file.
</action>
<read_first>
- `.planning/phases/01-foundation-supabase-infrastructure-setup/01-RESEARCH.md` — All SQL sections
</read_first>
<acceptance_criteria>
- `e:\ResQ AI\.planning\phases\01-foundation-supabase-infrastructure-setup\schema.sql` exists
- File contains `CREATE TABLE profiles`
- File contains `CREATE TABLE disaster_events`
- File contains `GEOGRAPHY(POINT, 4326)`
- File contains `CREATE INDEX idx_profiles_location ON profiles USING GIST`
</acceptance_criteria>
</task>

## Verification

```sql
-- Run these via MCP execute_sql after all migrations:

-- 1. All 7 tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles','disaster_events','user_reports','sos_requests','safe_zones','volunteers','notifications');
-- Must return 7 rows

-- 2. Spatial columns exist
SELECT table_name, column_name, udt_name FROM information_schema.columns
WHERE udt_name = 'geography' AND table_schema = 'public';
-- Must return multiple rows

-- 3. RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables should have rowsecurity = true

-- 4. Spatial functions work
SELECT * FROM get_safe_zones_nearby(28.6139, 77.2090, 50000);
-- Must execute without error
```

## must_haves

- All 7 tables created with correct PostGIS geography columns
- GIST indexes exist on all spatial columns
- RLS enabled and at least 12 policies created
- `get_safe_zones_nearby`, `get_users_in_radius`, `get_events_near` functions exist and execute without error
- Auth trigger `on_auth_user_created` exists and fires on new user creation
- Realtime enabled for disaster_events, user_reports, sos_requests
