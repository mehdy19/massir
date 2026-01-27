-- إضافة سياسة تسمح للسائقين بعرض جميع رحلاتهم (أي حالة)
CREATE POLICY "Drivers can view their own trips" 
ON public.trips 
FOR SELECT 
USING (driver_id = auth.uid());

-- إضافة WITH CHECK للسياسة UPDATE للتأكد من أن السائق يمكنه تحديث رحلته حتى بعد تغيير الحالة
DROP POLICY IF EXISTS "Drivers can update their own trips" ON public.trips;
CREATE POLICY "Drivers can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());