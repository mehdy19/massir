-- Add route_cities column to trips table
ALTER TABLE public.trips ADD COLUMN route_cities text[] NOT NULL DEFAULT '{}';

-- Add from_city and to_city columns to bookings table
ALTER TABLE public.bookings ADD COLUMN from_city text NOT NULL DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN to_city text NOT NULL DEFAULT '';

-- Update trips to remove old from_city and to_city columns and use route_cities instead
-- The first city in route_cities is the starting point, the last is the destination
-- For backward compatibility, we'll keep from_city and to_city for now but they'll be derived from route_cities

-- Add a check to ensure route_cities has at least 2 cities
ALTER TABLE public.trips ADD CONSTRAINT route_cities_minimum CHECK (array_length(route_cities, 1) >= 2);