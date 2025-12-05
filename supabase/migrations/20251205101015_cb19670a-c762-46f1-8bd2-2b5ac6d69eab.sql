-- دالة لإرسال إشعار للعملاء عند حجز رحلة
CREATE OR REPLACE FUNCTION public.notify_user_on_trip_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trip_info RECORD;
BEGIN
  -- جلب معلومات الرحلة
  SELECT t.from_city, t.to_city, t.departure_time INTO trip_info
  FROM trips t WHERE t.id = NEW.trip_id;
  
  -- إنشاء إشعار تأكيد الحجز للمستخدم
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.user_id,
    'تم تأكيد حجزك',
    'تم حجز ' || NEW.seats_booked || ' مقعد في رحلة ' || trip_info.from_city || ' → ' || trip_info.to_city || ' بتاريخ ' || to_char(trip_info.departure_time, 'DD/MM/YYYY HH24:MI'),
    'booking_confirmed',
    jsonb_build_object('booking_id', NEW.id, 'trip_id', NEW.trip_id, 'seats', NEW.seats_booked)
  );
  
  RETURN NEW;
END;
$$;

-- تريجر لإشعار المستخدم عند الحجز
DROP TRIGGER IF EXISTS on_user_booking_created ON public.bookings;
CREATE TRIGGER on_user_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_on_trip_booking();

-- دالة لإرسال إشعار للعملاء عند انطلاق الرحلة
CREATE OR REPLACE FUNCTION public.notify_users_on_trip_start()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- التحقق من أن الحالة تغيرت إلى "started"
  IF NEW.status = 'started' AND (OLD.status IS NULL OR OLD.status != 'started') THEN
    -- إرسال إشعار لكل العملاء الذين حجزوا
    FOR booking_record IN 
      SELECT DISTINCT user_id FROM bookings WHERE trip_id = NEW.id AND status = 'confirmed'
    LOOP
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (
        booking_record.user_id,
        'رحلتك انطلقت!',
        'انطلقت الرحلة من ' || NEW.from_city || ' إلى ' || NEW.to_city || '. تتبع موقع السائق الآن!',
        'trip_started',
        jsonb_build_object('trip_id', NEW.id)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- تريجر لإشعار العملاء عند انطلاق الرحلة
DROP TRIGGER IF EXISTS on_trip_started ON public.trips;
CREATE TRIGGER on_trip_started
  AFTER UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_on_trip_start();