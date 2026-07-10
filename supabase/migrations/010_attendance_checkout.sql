-- ============================================================
-- 010: Shift Tracking / Checkout
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add check_out_time to attendance
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS check_out_time timestamptz;

-- 2. Allow housekeepers to update their own attendance to set check_out_time
DROP POLICY IF EXISTS "Housekeepers can checkout" ON public.attendance;
CREATE POLICY "Housekeepers can checkout" ON public.attendance FOR UPDATE
USING (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('cleaner', 'housekeeper')
)
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('cleaner', 'housekeeper')
);
