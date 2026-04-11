-- ============================================================
-- Phase 4.0: Visit Availability & Slots
-- ============================================================

-- Add visit_days and visit_slots to listings table
-- visit_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
-- visit_slots: ['Morning', 'Afternoon', 'Evening']

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS visit_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visit_slots text[] DEFAULT '{}';

-- Optional: Add a comment to describe the columns
COMMENT ON COLUMN listings.visit_days IS 'Preferred days for visits (e.g., Mon, Wed, Fri)';
COMMENT ON COLUMN listings.visit_slots IS 'Preferred time slots (Morning, Afternoon, Evening)';
