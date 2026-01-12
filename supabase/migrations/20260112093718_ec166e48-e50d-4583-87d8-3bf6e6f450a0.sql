-- Add user_id column to consultation_requests to support user requests
ALTER TABLE public.consultation_requests 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Add request_type to differentiate between driver and user requests
ALTER TABLE public.consultation_requests 
ADD COLUMN request_type text NOT NULL DEFAULT 'driver';

-- Update existing records to have driver as user_id (for backward compatibility)
UPDATE public.consultation_requests SET user_id = driver_id WHERE user_id IS NULL;

-- Create RLS policy for users to create consultation requests
CREATE POLICY "Users can create consultation requests" 
ON public.consultation_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND request_type = 'user');

-- Create RLS policy for users to view their own requests
CREATE POLICY "Users can view their own requests" 
ON public.consultation_requests 
FOR SELECT 
USING (user_id = auth.uid());