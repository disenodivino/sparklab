-- Add plain password column to teams table for organizer viewing
-- WARNING: Storing plain text passwords is not secure. Only do this if you understand the security implications.
-- This is for organizer convenience to share credentials with teams.

ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS password text;

-- Optionally, you can update existing teams with a default password
-- UPDATE public.teams SET password = 'default123' WHERE password IS NULL;
