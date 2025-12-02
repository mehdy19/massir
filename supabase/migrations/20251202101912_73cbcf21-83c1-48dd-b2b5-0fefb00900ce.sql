-- Enable realtime for trips table
ALTER TABLE public.trips REPLICA IDENTITY FULL;

-- The table is already added to supabase_realtime publication by default
-- This ensures we get real-time updates for location changes