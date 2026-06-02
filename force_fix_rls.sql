-- Run this script in the Supabase SQL Editor.
-- It will completely reset the SELECT permissions so both admins and citizens can see the data.

-- 1. Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop common restrictive or conflicting policies
DROP POLICY IF EXISTS "Public can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Create an absolute permissive policy for EVERYONE (anon and authenticated)
CREATE POLICY "Enable universal read access on profiles" 
ON public.profiles 
AS PERMISSIVE 
FOR SELECT 
TO public
USING (true);

-- 2. Volunteer Applications Table
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read applications" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.volunteer_applications;

CREATE POLICY "Enable universal read access on applications" 
ON public.volunteer_applications 
AS PERMISSIVE 
FOR SELECT 
TO public
USING (true);
