-- Add gender column to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));

-- Optional: Add a comment to describe the column
COMMENT ON COLUMN profiles.gender IS 'User gender for avatar selection (male, female, other)';