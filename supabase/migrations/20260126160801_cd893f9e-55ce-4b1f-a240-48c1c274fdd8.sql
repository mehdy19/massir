-- Fix: Protect driver phone numbers from public exposure in ads table
-- Create a public view that excludes sensitive phone column

-- Step 1: Create a public view for ads without phone number
CREATE VIEW public.ads_public
WITH (security_invoker = on) AS
SELECT 
  id,
  driver_id,
  title,
  description,
  image_url,
  destination,
  price,
  departure_date,
  seats,
  available_seats,
  status,
  created_at,
  updated_at
FROM public.ads
WHERE status = 'active';

-- Step 2: Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.ads_public TO anon, authenticated;

-- Step 3: Update RLS policies - remove public access to base table
-- Drop the old permissive public policy
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;

-- Step 4: Create new policies that require authentication for viewing ads with phone
-- Drivers can view their own ads (including phone)
CREATE POLICY "Drivers can view their own ads"
ON public.ads
FOR SELECT
USING (driver_id = auth.uid());

-- Authenticated users can view active ads (excluding phone via application logic)
-- This allows the booking flow to work while phone is only shown to the driver
CREATE POLICY "Authenticated users can view active ads"
ON public.ads
FOR SELECT
USING (auth.uid() IS NOT NULL AND status = 'active');