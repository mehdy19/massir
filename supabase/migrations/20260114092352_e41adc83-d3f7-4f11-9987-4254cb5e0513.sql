-- Allow admins to update any ads
CREATE POLICY "Admins can update all ads" 
ON public.ads 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any ads
CREATE POLICY "Admins can delete all ads" 
ON public.ads 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));