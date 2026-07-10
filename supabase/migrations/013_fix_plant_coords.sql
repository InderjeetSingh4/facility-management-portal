-- ============================================================
-- 013: Fix plant coordinates + allow retry of rejected attendance
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Update plant coordinates to Mumbai (to match your Chrome Sensors test location)
UPDATE public.plants 
SET latitude = 19.075984, 
    longitude = 72.877656, 
    geofence_radius_meters = 50000 
WHERE latitude IS NOT NULL;

-- 2. Allow deleting rejected attendance so users can retry
DROP POLICY IF EXISTS "Users can delete rejected attendance" ON public.attendance;
CREATE POLICY "Users can delete rejected attendance" ON public.attendance FOR DELETE
USING (
  user_id = auth.uid()
  AND status = 'rejected_out_of_range'
);

-- 3. Clean up any existing rejected records
DELETE FROM public.attendance WHERE status = 'rejected_out_of_range';
