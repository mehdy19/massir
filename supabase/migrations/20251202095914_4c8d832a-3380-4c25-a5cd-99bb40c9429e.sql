-- Add route_prices column to store prices for each station
ALTER TABLE public.trips 
ADD COLUMN route_prices JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.trips.route_prices IS 'JSON object mapping each city in route_cities to its price to the final destination. Example: {"مدينة أ": 100, "مدينة ب": 70, "مدينة ج": 40}';

-- Update bookings table to store the actual price paid
ALTER TABLE public.bookings
ADD COLUMN price_paid NUMERIC;

-- Add comment
COMMENT ON COLUMN public.bookings.price_paid IS 'The actual price paid by the passenger based on their departure city';