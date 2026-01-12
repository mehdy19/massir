-- Add constraints to prevent negative available_seats
ALTER TABLE ads ADD CONSTRAINT ads_available_seats_check CHECK (available_seats >= 0);
ALTER TABLE trips ADD CONSTRAINT trips_available_seats_check CHECK (available_seats >= 0);

-- Create atomic booking function for ad bookings (tourism trips)
CREATE OR REPLACE FUNCTION book_ad_atomically(
  ad_id_param UUID,
  seats_param INT,
  user_id_param UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT, booking_id UUID) AS $$
DECLARE
  new_booking_id UUID;
BEGIN
  -- Validate input
  IF seats_param <= 0 THEN
    RETURN QUERY SELECT FALSE, 'عدد المقاعد يجب أن يكون أكبر من صفر'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Atomic update with row lock to prevent race condition
  UPDATE ads 
  SET available_seats = available_seats - seats_param,
      updated_at = now()
  WHERE id = ad_id_param 
    AND available_seats >= seats_param
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'عدد المقاعد المطلوبة غير متاح'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Insert booking after successful seat reservation
  INSERT INTO ad_bookings (ad_id, user_id, seats_booked, status)
  VALUES (ad_id_param, user_id_param, seats_param, 'pending')
  RETURNING id INTO new_booking_id;
  
  RETURN QUERY SELECT TRUE, 'تم الحجز بنجاح'::TEXT, new_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create atomic booking function for regular trips
CREATE OR REPLACE FUNCTION book_trip_atomically(
  trip_id_param UUID,
  seats_param INT,
  user_id_param UUID,
  from_city_param TEXT,
  to_city_param TEXT,
  price_param NUMERIC
)
RETURNS TABLE(success BOOLEAN, message TEXT, booking_id UUID) AS $$
DECLARE
  new_booking_id UUID;
BEGIN
  -- Validate input
  IF seats_param <= 0 THEN
    RETURN QUERY SELECT FALSE, 'عدد المقاعد يجب أن يكون أكبر من صفر'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Atomic update with row lock to prevent race condition
  UPDATE trips 
  SET available_seats = available_seats - seats_param,
      updated_at = now()
  WHERE id = trip_id_param 
    AND available_seats >= seats_param
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'عدد المقاعد المطلوبة غير متاح'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Insert booking after successful seat reservation
  INSERT INTO bookings (trip_id, user_id, seats_booked, from_city, to_city, price_paid, status)
  VALUES (trip_id_param, user_id_param, seats_param, from_city_param, to_city_param, price_param, 'confirmed')
  RETURNING id INTO new_booking_id;
  
  RETURN QUERY SELECT TRUE, 'تم الحجز بنجاح'::TEXT, new_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the old trigger that updates trip seats since the atomic function handles it
DROP TRIGGER IF EXISTS update_trip_seats_trigger ON bookings;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION book_ad_atomically TO authenticated;
GRANT EXECUTE ON FUNCTION book_trip_atomically TO authenticated;