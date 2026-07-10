-- ============================================================
-- 009: Geofenced Housekeeper Attendance
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add location data to plants
ALTER TABLE public.plants
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS geofence_radius_meters integer not null default 150;

-- 2. Backfill dummy location data (New Delhi as default center) and a massive 50km radius for local testing
UPDATE public.plants 
SET latitude = 28.6139, 
    longitude = 77.2090, 
    geofence_radius_meters = 50000 
WHERE latitude IS NULL;

-- 3. Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  check_in_time timestamptz not null default now(),
  check_in_latitude double precision not null,
  check_in_longitude double precision not null,
  distance_from_plant_meters numeric not null,
  status text not null check (status in ('present', 'rejected_out_of_range')),
  created_at timestamptz not null default now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Housekeepers can insert only their own attendance rows scoped to their own plant_id
DROP POLICY IF EXISTS "Housekeepers can insert own attendance" ON public.attendance;
CREATE POLICY "Housekeepers can insert own attendance" ON public.attendance FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND plant_id = (auth.jwt() -> 'app_metadata' ->> 'plant_id')::uuid
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('cleaner', 'housekeeper')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- Housekeepers can read their own attendance
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT
USING (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- Local Admins can view attendance for their own plant
DROP POLICY IF EXISTS "Local admins can view plant attendance" ON public.attendance;
CREATE POLICY "Local admins can view plant attendance" ON public.attendance FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_admin'
  AND plant_id = (auth.jwt() -> 'app_metadata' ->> 'plant_id')::uuid
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- Super Admins can view all attendance
DROP POLICY IF EXISTS "Super admins can view all attendance" ON public.attendance;
CREATE POLICY "Super admins can view all attendance" ON public.attendance FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- No UPDATE or DELETE policies intentionally. Attendance records are immutable.
