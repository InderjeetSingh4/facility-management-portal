-- ============================================================
-- 008: Admin Approval for Signups
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add approval_status to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS approval_status text not null default 'pending'
  CHECK (approval_status in ('pending', 'approved', 'rejected'));

-- Backfill existing users to approved so they don't lose access
UPDATE public.users SET approval_status = 'approved';

-- 2. Update the JWT Auth Hook to inject approval_status into app_metadata
CREATE OR REPLACE FUNCTION public.sync_user_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data 
    || jsonb_build_object('plant_id', NEW.plant_id)
    || jsonb_build_object('approval_status', NEW.approval_status)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_app_metadata ON public.users;
CREATE TRIGGER sync_app_metadata
AFTER INSERT OR UPDATE OF plant_id, approval_status ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_app_metadata();

-- Re-trigger for all existing users to backfill approval_status into auth.users.raw_app_meta_data
UPDATE public.users SET approval_status = 'approved' WHERE approval_status = 'approved';

-- 3. Update the bootstrap trigger to default to pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role, plant_id, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    (NEW.raw_user_meta_data->>'plant_id')::uuid,
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    plant_id = EXCLUDED.plant_id,
    approval_status = EXCLUDED.approval_status;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update all RLS policies to require approval_status = 'approved'

-- TABLE: checklist_tasks
DROP POLICY IF EXISTS "Admins can manage checklist tasks" ON public.checklist_tasks;
CREATE POLICY "Admins can manage checklist tasks" ON public.checklist_tasks FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Authenticated users can view checklist tasks" ON public.checklist_tasks;
CREATE POLICY "Authenticated users can view checklist tasks" ON public.checklist_tasks FOR SELECT
USING (
  auth.uid() is not null 
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- TABLE: checklist_completions
DROP POLICY IF EXISTS "Admins can manage all completions" ON public.checklist_completions;
CREATE POLICY "Admins can manage all completions" ON public.checklist_completions FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Staff can view all completions" ON public.checklist_completions;
CREATE POLICY "Staff can view all completions" ON public.checklist_completions FOR SELECT
USING (
  auth.uid() is not null 
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Staff can mark their own completions" ON public.checklist_completions;
CREATE POLICY "Staff can mark their own completions" ON public.checklist_completions FOR INSERT
WITH CHECK (
  completed_by = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'role') in ('housekeeper', 'cleaner', 'employee', 'local_admin', 'super_admin')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Staff can uncheck their own completions" ON public.checklist_completions;
CREATE POLICY "Staff can uncheck their own completions" ON public.checklist_completions FOR DELETE
USING (
  completed_by = auth.uid() 
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- TABLE: complaints
DROP POLICY IF EXISTS "Staff can resolve complaints" ON public.complaints;
CREATE POLICY "Staff can resolve complaints" ON public.complaints FOR UPDATE
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin', 'housekeeper', 'cleaner', 'employee')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin', 'housekeeper', 'cleaner', 'employee')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- TABLE: room_bookings
DROP POLICY IF EXISTS "Staff can prep rooms" ON public.room_bookings;
CREATE POLICY "Staff can prep rooms" ON public.room_bookings FOR UPDATE
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin', 'housekeeper', 'cleaner')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('local_admin', 'super_admin', 'housekeeper', 'cleaner')
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Users can delete own bookings" ON public.room_bookings;
CREATE POLICY "Users can delete own bookings" ON public.room_bookings FOR DELETE
USING (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- TABLE: push_subscriptions
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions FOR ALL
USING (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
)
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

-- TABLE: conference_rooms
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.conference_rooms;
CREATE POLICY "Authenticated users can view rooms" ON public.conference_rooms FOR SELECT
USING (
  auth.uid() is not null
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.room_bookings;
CREATE POLICY "Authenticated users can view bookings" ON public.room_bookings FOR SELECT
USING (
  auth.uid() is not null
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);

DROP POLICY IF EXISTS "Authenticated users can book rooms" ON public.room_bookings;
CREATE POLICY "Authenticated users can book rooms" ON public.room_bookings FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt() -> 'app_metadata' ->> 'approval_status') = 'approved'
);
