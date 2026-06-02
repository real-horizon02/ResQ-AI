-- Create rescue_requests table for volunteer rescue requests
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rescue_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id VARCHAR(255) NOT NULL,
  volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_name TEXT,
  volunteer_email TEXT,
  volunteer_phone TEXT,
  volunteer_skills TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS rescue_requests_volunteer_id_idx ON rescue_requests(volunteer_id);
CREATE INDEX IF NOT EXISTS rescue_requests_incident_id_idx ON rescue_requests(incident_id);
CREATE INDEX IF NOT EXISTS rescue_requests_status_idx ON rescue_requests(status);
CREATE INDEX IF NOT EXISTS rescue_requests_created_at_idx ON rescue_requests(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE rescue_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can insert their own requests
CREATE POLICY "Volunteers can create rescue requests" ON rescue_requests
  FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

-- Policy: Volunteers can view their own requests
CREATE POLICY "Volunteers can view own rescue requests" ON rescue_requests
  FOR SELECT USING (auth.uid() = volunteer_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all rescue requests" ON rescue_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update rescue requests" ON rescue_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add comment to describe the table
COMMENT ON TABLE rescue_requests IS 'Stores volunteer rescue mission requests that need admin approval';

-- Optional: Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_rescue_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rescue_requests_updated_at
  BEFORE UPDATE ON rescue_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_rescue_requests_updated_at();