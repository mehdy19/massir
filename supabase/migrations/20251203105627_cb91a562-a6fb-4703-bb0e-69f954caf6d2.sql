-- Create ads table for tourism trip advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  destination TEXT NOT NULL,
  price NUMERIC NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  available_seats INTEGER NOT NULL DEFAULT 1,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Anyone can view active ads
CREATE POLICY "Anyone can view active ads"
ON public.ads FOR SELECT
USING (status = 'active');

-- Drivers can create ads
CREATE POLICY "Drivers can create ads"
ON public.ads FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'driver'
  ) AND driver_id = auth.uid()
);

-- Drivers can update their own ads
CREATE POLICY "Drivers can update their own ads"
ON public.ads FOR UPDATE
USING (driver_id = auth.uid());

-- Drivers can delete their own ads
CREATE POLICY "Drivers can delete their own ads"
ON public.ads FOR DELETE
USING (driver_id = auth.uid());

-- Create ad_bookings table
CREATE TABLE public.ad_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own ad bookings"
ON public.ad_bookings FOR SELECT
USING (user_id = auth.uid());

-- Drivers can view bookings for their ads
CREATE POLICY "Drivers can view bookings for their ads"
ON public.ad_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ads
    WHERE ads.id = ad_bookings.ad_id AND ads.driver_id = auth.uid()
  )
);

-- Users can create bookings
CREATE POLICY "Users can create ad bookings"
ON public.ad_bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can cancel their bookings
CREATE POLICY "Users can update their ad bookings"
ON public.ad_bookings FOR UPDATE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();