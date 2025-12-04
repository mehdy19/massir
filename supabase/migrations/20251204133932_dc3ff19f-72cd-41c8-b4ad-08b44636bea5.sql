-- جدول الإشعارات
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'booking',
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- دالة لإنشاء إشعار عند حجز رحلة عادية
CREATE OR REPLACE FUNCTION public.notify_driver_on_trip_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_id_var UUID;
  trip_info RECORD;
  user_name TEXT;
BEGIN
  -- جلب معلومات الرحلة
  SELECT t.driver_id, t.from_city, t.to_city INTO trip_info
  FROM trips t WHERE t.id = NEW.trip_id;
  
  -- جلب اسم المستخدم
  SELECT full_name INTO user_name
  FROM profiles WHERE id = NEW.user_id;
  
  -- إنشاء الإشعار للسائق
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    trip_info.driver_id,
    'حجز جديد',
    'قام ' || COALESCE(user_name, 'مستخدم') || ' بحجز ' || NEW.seats_booked || ' مقعد في رحلتك من ' || trip_info.from_city || ' إلى ' || trip_info.to_city,
    'trip_booking',
    jsonb_build_object('booking_id', NEW.id, 'trip_id', NEW.trip_id, 'seats', NEW.seats_booked)
  );
  
  RETURN NEW;
END;
$$;

-- دالة لإنشاء إشعار عند حجز رحلة سياحية
CREATE OR REPLACE FUNCTION public.notify_driver_on_ad_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_id_var UUID;
  ad_info RECORD;
  user_name TEXT;
BEGIN
  -- جلب معلومات الإعلان
  SELECT a.driver_id, a.title, a.destination INTO ad_info
  FROM ads a WHERE a.id = NEW.ad_id;
  
  -- جلب اسم المستخدم
  SELECT full_name INTO user_name
  FROM profiles WHERE id = NEW.user_id;
  
  -- إنشاء الإشعار للسائق
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    ad_info.driver_id,
    'حجز سياحي جديد',
    'قام ' || COALESCE(user_name, 'مستخدم') || ' بحجز ' || NEW.seats_booked || ' مقعد في رحلتك السياحية "' || ad_info.title || '"',
    'ad_booking',
    jsonb_build_object('booking_id', NEW.id, 'ad_id', NEW.ad_id, 'seats', NEW.seats_booked)
  );
  
  RETURN NEW;
END;
$$;

-- تريجر للرحلات العادية
CREATE TRIGGER on_trip_booking_created
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_driver_on_trip_booking();

-- تريجر للرحلات السياحية
CREATE TRIGGER on_ad_booking_created
AFTER INSERT ON ad_bookings
FOR EACH ROW
EXECUTE FUNCTION notify_driver_on_ad_booking();

-- تفعيل Realtime للإشعارات
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;