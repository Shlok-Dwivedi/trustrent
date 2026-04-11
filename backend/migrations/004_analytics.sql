-- Phase 6.0: Analytics Migration
-- Add view tracking to listings

ALTER TABLE listings ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Optional: Add a function to increment safely to avoid race conditions
-- But for a MVP, simple UPDATE is fine via the API.
