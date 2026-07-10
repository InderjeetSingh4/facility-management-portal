-- ============================================================
-- 006: Performance Optimizations
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create Indexes on heavily queried and RLS-filtered columns
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_plant_id ON public.checklist_tasks (plant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_plant_id ON public.complaints (plant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status_date ON public.complaints (is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_date ON public.room_bookings (room_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_conference_rooms_plant_id ON public.conference_rooms (plant_id);

-- 2. JWT Auth Hook / Trigger to inject plant_id into app_metadata
-- This allows RLS and Next.js to read plant_id without querying public.users

CREATE OR REPLACE FUNCTION public.sync_user_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('plant_id', NEW.plant_id)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to allow re-running
DROP TRIGGER IF EXISTS sync_app_metadata ON public.users;

CREATE TRIGGER sync_app_metadata
AFTER INSERT OR UPDATE OF plant_id ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_app_metadata();

-- 3. Backfill existing users' plant_id into auth.users.raw_app_meta_data
UPDATE auth.users au
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('plant_id', pu.plant_id)
FROM public.users pu
WHERE au.id = pu.id;

-- 4. Fast RPC for Dashboard Stats
-- This calculates Tasks Today and Completed Tasks in a single efficient query.
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_plant_id UUID,
  p_today DATE,
  p_dow INT
)
RETURNS JSON AS $$
DECLARE
  v_total_tasks INT;
  v_completed_tasks INT;
  v_result JSON;
BEGIN
  -- We left join checklist_completions filtered by today's date
  SELECT 
    COUNT(ct.id) AS total_tasks,
    COUNT(cc.id) AS completed_tasks
  INTO v_total_tasks, v_completed_tasks
  FROM public.checklist_tasks ct
  LEFT JOIN public.checklist_completions cc 
    ON ct.id = cc.task_id AND cc.completed_date = p_today
  WHERE ct.plant_id = p_plant_id
    AND (
      ct.frequency = 'daily'
      OR (ct.frequency = 'weekly' AND ct.day_of_week = p_dow)
      OR (ct.frequency = 'one-off' AND ct.target_date = p_today)
    );

  v_result := json_build_object(
    'totalTasks', v_total_tasks,
    'completedTasks', v_completed_tasks
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
