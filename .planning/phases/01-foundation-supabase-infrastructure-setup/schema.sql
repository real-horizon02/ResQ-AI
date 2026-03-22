-- ResQ AI Database Schema Reference
-- This file is a reference copy. The actual schema is applied via Supabase migrations.
-- Last updated: 2026-03-22

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Profiles Table
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

-- Disaster Events Table
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

-- User Reports Table
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

-- Indexes
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_disaster_epicenter ON disaster_events USING GIST (epicenter);
CREATE INDEX idx_disaster_affected_area ON disaster_events USING GIST (affected_area);
CREATE INDEX idx_user_reports_location ON user_reports USING GIST (location);
CREATE INDEX idx_sos_requests_location ON sos_requests USING GIST (location);
CREATE INDEX idx_safe_zones_location ON safe_zones USING GIST (location);
CREATE INDEX idx_volunteers_location ON volunteers USING GIST (last_known_location);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Spatial Functions
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
