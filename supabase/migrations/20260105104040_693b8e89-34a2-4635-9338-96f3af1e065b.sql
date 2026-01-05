-- Create lost_items table
CREATE TABLE public.lost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  item_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  driver_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports"
ON public.lost_items
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Drivers can view reports for their trips"
ON public.lost_items
FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Users can create reports"
ON public.lost_items
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Drivers can update reports"
ON public.lost_items
FOR UPDATE
USING (driver_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_lost_items_updated_at
BEFORE UPDATE ON public.lost_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Notification trigger for drivers
CREATE OR REPLACE FUNCTION public.notify_driver_on_lost_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trip_info RECORD;
  user_name TEXT;
BEGIN
  -- Get trip info
  SELECT from_city, to_city INTO trip_info
  FROM trips WHERE id = NEW.trip_id;
  
  -- Get user name
  SELECT full_name INTO user_name
  FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification for driver
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.driver_id,
    'بلاغ عن أمتعة مفقودة',
    'أبلغ ' || COALESCE(user_name, 'راكب') || ' عن فقدان أمتعة في رحلة ' || trip_info.from_city || ' → ' || trip_info.to_city,
    'lost_item',
    jsonb_build_object('lost_item_id', NEW.id, 'trip_id', NEW.trip_id, 'booking_id', NEW.booking_id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_lost_item_created
AFTER INSERT ON public.lost_items
FOR EACH ROW
EXECUTE FUNCTION public.notify_driver_on_lost_item();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_items;