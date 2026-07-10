-- ============================================================
-- 014: Notification Preferences
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add notifications_enabled to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT NULL;
