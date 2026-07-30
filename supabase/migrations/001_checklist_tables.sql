-- ============================================================
-- Smart Daily Checklist — Schema & RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ----------------------------------------------------------------
-- TABLE 1: checklist_tasks
-- The master list of recurring / one-off tasks for a facility.
-- ----------------------------------------------------------------
create table if not exists public.checklist_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  frequency     text not null check (frequency in ('daily', 'weekly', 'one-off')),
  day_of_week   integer check (day_of_week between 0 and 6),   -- 0 = Sunday; null for non-weekly
  target_date   date,                                            -- null unless frequency = 'one-off'
  plant_id      uuid references public.plants(id) on delete cascade,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),

  -- Enforce: weekly tasks must have a day, one-off tasks must have a date
  constraint weekly_needs_day  check (frequency <> 'weekly'  or day_of_week is not null),
  constraint oneoff_needs_date check (frequency <> 'one-off' or target_date  is not null)
);

-- ----------------------------------------------------------------
-- TABLE 2: checklist_completions
-- One row per (task × date) per staff member who checked it off.
-- The unique constraint on (task_id, completed_date) means only
-- ONE person can mark a task done per day (shared checklist).
-- If you want multiple people to check the SAME task independently,
-- change the unique key to (task_id, completed_by, completed_date).
-- ----------------------------------------------------------------
create table if not exists public.checklist_completions (
  id              uuid primary key default gen_random_uuid(),
  task_id         uuid not null references public.checklist_tasks(id) on delete cascade,
  completed_by    uuid not null references auth.users(id) on delete cascade,
  completed_date  date not null default current_date,

  -- One completion record per task per day (shared tick-off)
  constraint unique_task_per_day unique (task_id, completed_date)
);

-- Helpful index for the join in getTodayTasks
create index if not exists idx_completions_task_date
  on public.checklist_completions (task_id, completed_date);

-- ----------------------------------------------------------------
-- HELPER: Role-checking expression (reads from app_metadata,
-- which is only writable by the service role — secure).
-- ----------------------------------------------------------------
-- Usage example:  (auth.jwt() -> 'user_metadata' ->> 'role') = 'local_admin'

-- ================================================================
-- RLS: checklist_tasks
-- ================================================================
alter table public.checklist_tasks enable row level security;

-- Admins: full CRUD access
create policy "Admins can manage checklist tasks"
  on public.checklist_tasks
  for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('local_admin', 'super_admin')
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('local_admin', 'super_admin')
  );

-- All authenticated users: read all tasks (plant filtering happens in app layer)
create policy "Authenticated users can view checklist tasks"
  on public.checklist_tasks
  for select
  using (
    auth.uid() is not null
  );

-- ================================================================
-- RLS: checklist_completions
-- ================================================================
alter table public.checklist_completions enable row level security;

-- Admins: full access (can see and manage all completions)
create policy "Admins can manage all completions"
  on public.checklist_completions
  for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('local_admin', 'super_admin')
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('local_admin', 'super_admin')
  );

-- Staff: can read ALL completions (to see who completed what)
create policy "Staff can view all completions"
  on public.checklist_completions
  for select
  using (
    auth.uid() is not null
  );

-- Staff: can only INSERT a completion for themselves
create policy "Staff can mark their own completions"
  on public.checklist_completions
  for insert
  with check (
    completed_by = auth.uid()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in (
      'housekeeper', 'cleaner', 'employee', 'local_admin', 'super_admin'
    )
  );

-- Staff: can only DELETE their own completion (un-check misclick)
create policy "Staff can uncheck their own completions"
  on public.checklist_completions
  for delete
  using (
    completed_by = auth.uid()
  );
