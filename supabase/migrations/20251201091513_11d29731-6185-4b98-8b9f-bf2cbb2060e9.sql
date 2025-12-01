-- Allow users to cancel their own bookings
CREATE POLICY "Users can cancel their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow drivers to delete their own trips
CREATE POLICY "Drivers can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (driver_id = auth.uid());