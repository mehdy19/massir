-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true);

-- Allow anyone to view ad images
CREATE POLICY "Ad images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

-- Allow authenticated users to upload ad images
CREATE POLICY "Users can upload ad images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own ad images
CREATE POLICY "Users can update their own ad images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own ad images
CREATE POLICY "Users can delete their own ad images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);