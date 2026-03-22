# Phase 1 Research: Foundation — Supabase + Infrastructure Setup

## 1. Supabase MCP & PostGIS Initialization

PostGIS must be enabled via SQL before creating spatial columns:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

For Supabase via MCP: use the firebase/supabase MCP `run_query` equivalent to execute SQL directly. The Supabase dashboard also has the Extensions section where PostGIS can be toggled on.

## 2. PostGIS Database Schema (Complete SQL)

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles Table (linked to Supabase Auth)
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

-- Disaster Events Table (official + AI predicted events)
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

-- User Reports Table (citizen incident reports)
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

-- SOS Requests Table
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

-- Safe Zones Table
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

-- Volunteers Table
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

-- Notifications Table
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

-- GIST Spatial Indexes
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_disaster_epicenter ON disaster_events USING GIST (epicenter);
CREATE INDEX idx_disaster_affected_area ON disaster_events USING GIST (affected_area);
CREATE INDEX idx_user_reports_location ON user_reports USING GIST (location);
CREATE INDEX idx_sos_requests_location ON sos_requests USING GIST (location);
CREATE INDEX idx_safe_zones_location ON safe_zones USING GIST (location);
CREATE INDEX idx_volunteers_location ON volunteers USING GIST (last_known_location);

-- Standard B-Tree indexes for common query patterns
CREATE INDEX idx_disaster_events_type ON disaster_events (type);
CREATE INDEX idx_disaster_events_status ON disaster_events (status);
CREATE INDEX idx_disaster_events_source ON disaster_events (source);
CREATE INDEX idx_user_reports_status ON user_reports (status);
CREATE INDEX idx_user_reports_user_id ON user_reports (user_id);
CREATE INDEX idx_sos_requests_status ON sos_requests (status);
CREATE INDEX idx_safe_zones_type ON safe_zones (type);
CREATE INDEX idx_safe_zones_is_active ON safe_zones (is_active);

-- Useful Spatial RPC Functions
CREATE OR REPLACE FUNCTION get_safe_zones_nearby(user_lat FLOAT, user_lon FLOAT, radius_meters FLOAT)
RETURNS TABLE (id UUID, name TEXT, type TEXT, distance_m FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT sz.id, sz.name, sz.type,
         ST_Distance(sz.location::geometry, ST_MakePoint(user_lon, user_lat)::geometry) AS distance_m
  FROM safe_zones sz
  WHERE is_active = true
    AND ST_DWithin(sz.location::geography, ST_MakePoint(user_lon, user_lat)::geography, radius_meters)
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_users_in_radius(center_lat FLOAT, center_lon FLOAT, radius_meters FLOAT)
RETURNS TABLE (id UUID, phone_number TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.phone_number FROM profiles p
  WHERE ST_DWithin(p.location::geography, ST_MakePoint(center_lon, center_lat)::geography, radius_meters);
END;
$$ LANGUAGE plpgsql;
```

## 3. RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- DISASTER EVENTS (public read, service_role write only)
CREATE POLICY "events_public_read" ON disaster_events FOR SELECT USING (true);

-- USER REPORTS
CREATE POLICY "reports_authenticated_insert" ON user_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "reports_verified_or_own_read" ON user_reports FOR SELECT 
  USING (status IN ('community_verified','admin_verified') OR auth.uid() = user_id);
CREATE POLICY "reports_own_update" ON user_reports FOR UPDATE USING (auth.uid() = user_id);

-- SOS REQUESTS
CREATE POLICY "sos_authenticated_insert" ON sos_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "sos_own_or_responder_read" ON sos_requests FOR SELECT 
  USING (auth.uid() = user_id OR (SELECT is_verified_responder FROM profiles WHERE id = auth.uid()));
CREATE POLICY "sos_responder_update" ON sos_requests FOR UPDATE 
  USING (auth.uid() = user_id OR (SELECT is_verified_responder FROM profiles WHERE id = auth.uid()));

-- SAFE ZONES (public read only)
CREATE POLICY "safe_zones_public_read" ON safe_zones FOR SELECT USING (true);

-- VOLUNTEERS
CREATE POLICY "volunteers_public_read" ON volunteers FOR SELECT USING (true);
CREATE POLICY "volunteers_own_update" ON volunteers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "volunteers_own_insert" ON volunteers FOR INSERT WITH CHECK (auth.uid() = id);

-- NOTIFICATIONS (own read only)
CREATE POLICY "notifications_own_read" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
```

## 4. Supabase Auth Configuration

**Phone OTP (Twilio):**
- Dashboard → Authentication → Providers → Phone → Enable
- Provider: Twilio
- Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGE_SERVICE_SID
- Client usage: `supabase.auth.signInWithOtp({ phone: '+91XXXXXXXXXX' })`

**Magic Link (Email):**
- Dashboard → Authentication → Providers → Email → Enable Magic Link
- Custom SMTP: Resend.com recommended (free tier, reliable)
- `supabase.auth.signInWithOtp({ email: 'user@example.com' })`

**Auto-create profile on signup:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 5. Supabase Realtime

Enable Realtime in Dashboard → Database → Replication for: `disaster_events`, `user_reports`, `sos_requests`.

React subscription pattern (using @supabase/supabase-js v2):
```javascript
// Single channel, multiple table subscriptions
const channel = supabase
  .channel('live-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'disaster_events' }, handleDisasterUpdate)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_reports' }, handleNewReport)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, handleSos)
  .subscribe()

// Cleanup
return () => supabase.removeChannel(channel)
```

**IMPORTANT:** Use one channel per page/component, not one per user. Supabase limits concurrent channels per project.

## 6. Supabase Storage

```
Bucket: incident-media (public)
  Policies:
    - INSERT: auth.role() = 'authenticated'
    - SELECT: true (public)
    - DELETE: auth.uid() = owner_id (set via metadata)
  Max file size: 5MB per file
  Allowed types: image/*, video/*
```

## 7. Environment Variables (Vite React)

```env
# .env.local (gitignored)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For Vercel deployment (Dashboard → Project Settings → Environment Variables):
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

VITE_ prefix required for Vite to expose variables to client-side code.

## 8. Connection Pooling (PgBouncer)

Supabase uses Supavisor by default for connection pooling. For Edge Functions and external services:
- Use port **6543** (connection pooler) instead of 5432
- Mode: **transaction pooling** recommended for serverless
- The `@supabase/supabase-js` client uses PostgREST (HTTPS), already optimized — pooler only needed for direct psycopg2/prisma connections

## Validation Architecture

Test queries post-setup:
```sql
-- Verify PostGIS is enabled
SELECT PostGIS_Version();

-- Verify spatial indexes exist
SELECT schemaname, tablename, indexname FROM pg_indexes
WHERE indexname LIKE 'idx_%_location%';

-- Test ST_DWithin query
SELECT COUNT(*) FROM safe_zones
WHERE ST_DWithin(location::geography, ST_MakePoint(77.2090, 28.6139)::geography, 10000);
-- Should return 0 (no seed data yet) without error

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' ORDER BY tablename;
```

## RESEARCH COMPLETE

Phase 1 research on Supabase + PostGIS infrastructure is ready for planning.
