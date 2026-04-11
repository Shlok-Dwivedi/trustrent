-- ============================================================
-- TRUSTRENT — SUPABASE STORAGE SETUP
-- Run this in the Supabase SQL editor (after schema.sql)
-- ============================================================

-- 1. Create the storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  true,                                      -- Public bucket: anyone can read photos
  5242880,                                   -- 5 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;


-- 2. RLS policies for the bucket
-- Anyone can read/view photos (public)
CREATE POLICY "Public read listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

-- Only authenticated users (landlords) can upload
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-photos'
  AND auth.role() = 'authenticated'
);

-- Only the uploader can delete their own photos
CREATE POLICY "Users can delete own listing photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
