CREATE OR REPLACE FUNCTION public.notify_driver_on_lost_item()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  trip_info RECORD;
  ad_info RECORD;
  user_name TEXT;
  trip_label TEXT;
BEGIN
  SELECT from_city, to_city INTO trip_info FROM trips WHERE id = NEW.trip_id;

  IF trip_info.from_city IS NOT NULL THEN
    trip_label := trip_info.from_city || ' → ' || trip_info.to_city;
  ELSE
    SELECT title, destination INTO ad_info FROM ads WHERE id = NEW.trip_id;
    IF ad_info.title IS NOT NULL THEN
      trip_label := ad_info.title || ' (' || COALESCE(ad_info.destination, '') || ')';
    ELSE
      trip_label := 'إحدى الرحلات';
    END IF;
  END IF;

  SELECT full_name INTO user_name FROM profiles WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.driver_id,
    'بلاغ عن أمتعة مفقودة',
    'أبلغ ' || COALESCE(user_name, 'راكب') || ' عن فقدان أمتعة في رحلة ' || trip_label,
    'lost_item',
    jsonb_build_object('lost_item_id', NEW.id, 'trip_id', NEW.trip_id, 'booking_id', NEW.booking_id)
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_user_on_lost_item_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  trip_info RECORD;
  ad_info RECORD;
  status_text TEXT;
  trip_label TEXT;
BEGIN
  IF (OLD.status != NEW.status) OR (OLD.driver_response IS DISTINCT FROM NEW.driver_response) THEN
    SELECT from_city, to_city INTO trip_info FROM trips WHERE id = NEW.trip_id;
    IF trip_info.from_city IS NOT NULL THEN
      trip_label := trip_info.from_city || ' → ' || trip_info.to_city;
    ELSE
      SELECT title, destination INTO ad_info FROM ads WHERE id = NEW.trip_id;
      IF ad_info.title IS NOT NULL THEN
        trip_label := ad_info.title;
      ELSE
        trip_label := 'إحدى الرحلات';
      END IF;
    END IF;

    CASE NEW.status
      WHEN 'found' THEN status_text := 'تم العثور على الأمتعة';
      WHEN 'not_found' THEN status_text := 'لم يتم العثور على الأمتعة';
      WHEN 'resolved' THEN status_text := 'تم حل المشكلة';
      ELSE status_text := 'تحديث على البلاغ';
    END CASE;

    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.user_id,
      status_text,
      'رد السائق على بلاغك عن الأمتعة المفقودة في رحلة ' || trip_label || COALESCE(': ' || NEW.driver_response, ''),
      'lost_item_response',
      jsonb_build_object('lost_item_id', NEW.id, 'trip_id', NEW.trip_id, 'status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$function$;