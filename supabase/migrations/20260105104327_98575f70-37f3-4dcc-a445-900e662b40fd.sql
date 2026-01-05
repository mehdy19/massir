-- Notification trigger for passenger when driver responds
CREATE OR REPLACE FUNCTION public.notify_user_on_lost_item_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trip_info RECORD;
  status_text TEXT;
BEGIN
  -- Only trigger when status changes or driver_response is updated
  IF (OLD.status != NEW.status) OR (OLD.driver_response IS DISTINCT FROM NEW.driver_response) THEN
    -- Get trip info
    SELECT from_city, to_city INTO trip_info
    FROM trips WHERE id = NEW.trip_id;
    
    -- Determine status text
    CASE NEW.status
      WHEN 'found' THEN status_text := 'تم العثور على الأمتعة';
      WHEN 'not_found' THEN status_text := 'لم يتم العثور على الأمتعة';
      WHEN 'resolved' THEN status_text := 'تم حل المشكلة';
      ELSE status_text := 'تحديث على البلاغ';
    END CASE;
    
    -- Create notification for user
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.user_id,
      status_text,
      'رد السائق على بلاغك عن الأمتعة المفقودة في رحلة ' || trip_info.from_city || ' → ' || trip_info.to_city || COALESCE(': ' || NEW.driver_response, ''),
      'lost_item_response',
      jsonb_build_object('lost_item_id', NEW.id, 'trip_id', NEW.trip_id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_lost_item_response
AFTER UPDATE ON public.lost_items
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_on_lost_item_response();