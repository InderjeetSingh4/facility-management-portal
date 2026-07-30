-- ============================================================
-- Complaints Refinement — Add resolution tracking & RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add new columns
alter table public.complaints
  add column if not exists is_resolved boolean not null default false;

alter table public.complaints
  add column if not exists resolved_by uuid references auth.users(id) on delete set null;

-- 2. RLS: Allow housekeepers/cleaners to UPDATE complaints (mark resolved)
-- Drop if re-running
drop policy if exists "Staff can resolve complaints" on public.complaints;

create policy "Staff can resolve complaints"
  on public.complaints
  for update
  using (auth.uid() is not null)
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in (
      'housekeeper', 'cleaner', 'local_admin', 'super_admin'
    )
  );
