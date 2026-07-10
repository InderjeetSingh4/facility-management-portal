-- ============================================================
-- 012: Bulletproof RLS for Attendance
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop the finicky token-based policies
DROP POLICY IF EXISTS "Housekeepers can insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Local admins can view plant attendance" ON public.attendance;
DROP POLICY IF EXISTS "Super admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Housekeepers can checkout" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view attendance" ON public.attendance;

-- 1. Insert Attendance (Check In)
CREATE POLICY "Housekeepers can insert own attendance" ON public.attendance FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.plant_id = attendance.plant_id
      AND u.role = 'cleaner'
      AND u.approval_status = 'approved'
  )
);

-- 2. Update Attendance (Check Out)
CREATE POLICY "Housekeepers can checkout" ON public.attendance FOR UPDATE
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'cleaner'
      AND u.approval_status = 'approved'
  )
)
WITH CHECK (
  user_id = auth.uid()
);

-- 3. View own attendance
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT
USING (
  user_id = auth.uid()
);

-- 4. Admins can view attendance
CREATE POLICY "Admins can view attendance" ON public.attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.approval_status = 'approved'
      AND (
        u.role = 'super_admin'
        OR (u.role = 'local_admin' AND u.plant_id = attendance.plant_id)
      )
  )
);
