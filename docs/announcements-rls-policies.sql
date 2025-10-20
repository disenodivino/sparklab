-- Row Level Security (RLS) Policies for announcements table
-- Run these in your Supabase SQL Editor

-- Enable RLS on announcements table (if not already enabled)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow INSERT for all authenticated users (organizers can create announcements)
CREATE POLICY "Allow insert announcements for all authenticated users"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Allow INSERT for anonymous users (if using anon key)
CREATE POLICY "Allow insert announcements for anon"
ON public.announcements
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 3: Allow SELECT for all authenticated users (teams can read announcements)
CREATE POLICY "Allow select announcements for authenticated users"
ON public.announcements
FOR SELECT
TO authenticated
USING (true);

-- Policy 4: Allow SELECT for anonymous users (if needed)
CREATE POLICY "Allow select announcements for anon"
ON public.announcements
FOR SELECT
TO anon
USING (true);

-- Policy 5: Allow UPDATE for all authenticated users (if you need to edit announcements)
CREATE POLICY "Allow update announcements for authenticated users"
ON public.announcements
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 6: Allow DELETE for all authenticated users (if you need to delete announcements)
CREATE POLICY "Allow delete announcements for authenticated users"
ON public.announcements
FOR DELETE
TO authenticated
USING (true);
