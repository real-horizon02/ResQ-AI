-- Run this in your Supabase SQL Editor to allow admins to see all registered volunteers
CREATE POLICY "Public can read all profiles" 
ON public.profiles
FOR SELECT 
USING (true);
