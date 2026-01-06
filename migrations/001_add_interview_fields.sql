-- Migration: Add interview scheduling fields to contact_submissions table
-- Run this migration to support the new interview scheduling feature

-- Add preferred_time column
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS preferred_time TEXT DEFAULT '';

-- Add interview_duration column  
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS interview_duration TEXT DEFAULT '30';
