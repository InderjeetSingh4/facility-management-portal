-- ============================================================
-- 015: Accountability & Audit Trail for Complaints
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add audit-trail columns to complaints
-- resolved_by / resolved_at = worker who marked it done
-- approved_by / approved_at = manager who approved / rejected
-- rejection_note = optional reason for rejection

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS resolved_at   timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at   timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_note text;

-- 2. Ensure 'status' column exists and migrate to new enum values
-- The table already has a status column (text). We'll add a CHECK constraint.
-- First, migrate existing data:
UPDATE public.complaints
  SET status = 'approved'
  WHERE is_resolved = true AND (status IS NULL OR status = 'resolved' OR status = 'pending');

UPDATE public.complaints
  SET status = 'open'
  WHERE is_resolved = false AND (status IS NULL OR status = 'pending');

-- Set default for new rows
ALTER TABLE public.complaints
  ALTER COLUMN status SET DEFAULT 'open';

-- NOTE: We intentionally do NOT add a CHECK constraint because the column
-- may already contain legacy values. The application layer enforces the valid
-- values: 'open', 'pending_approval', 'approved', 'rejected'.


-- 3. RLS Policies for the new audit workflow
-- ─────────────────────────────────────────────

-- Drop old policies that conflict
DROP POLICY IF EXISTS "Staff can resolve complaints" ON public.complaints;

-- Workers/Staff: can update a complaint from 'open' → 'pending_approval'
CREATE POLICY "Staff can submit for approval"
  ON public.complaints
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND status = 'open'
  )
  WITH CHECK (
    status = 'pending_approval'
    AND resolved_by = auth.uid()
  );

-- Admins/Managers: can approve or reject pending complaints
CREATE POLICY "Admins can approve or reject complaints"
  ON public.complaints
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('local_admin', 'super_admin')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('local_admin', 'super_admin')
  );
