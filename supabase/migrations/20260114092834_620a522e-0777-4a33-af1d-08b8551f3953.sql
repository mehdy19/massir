-- Update default status for new ads to pending
ALTER TABLE public.ads ALTER COLUMN status SET DEFAULT 'pending';

-- Update RLS policy to only show active ads to public (pending ads won't be visible)
-- The existing policy "Anyone can view active ads" already handles this correctly