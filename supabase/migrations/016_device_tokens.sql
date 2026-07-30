-- ============================================================
-- 016: Device Token Management for Native Push Notifications
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add device_token column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS device_token text;

-- 2. Add composite index for efficient role-based push targeting per plant
CREATE INDEX IF NOT EXISTS idx_users_plant_role_token
  ON public.users (plant_id, role)
  WHERE device_token IS NOT NULL;
