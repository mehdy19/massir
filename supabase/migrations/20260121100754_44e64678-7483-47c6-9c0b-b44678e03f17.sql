-- Fix: Remove overly permissive INSERT policy on notifications table
-- SECURITY DEFINER trigger functions (notify_driver_on_trip_booking, notify_user_on_trip_booking, etc.) 
-- will continue to work because they bypass RLS

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;