-- ============================================================
-- Room Booking Prep Items Upgrade
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.room_bookings
  add column if not exists prep_items text[] default '{}',
  add column if not exists is_prepped boolean not null default false,
  add column if not exists prepped_by uuid references auth.users(id) on delete set null;

-- Add RLS policy so clean staff can update (mark as prepped)
-- Assuming staff roles can be local_admin, super_admin, housekeeper, cleaner
drop policy if exists "Staff can prep rooms" on public.room_bookings;

create policy "Staff can prep rooms"
  on public.room_bookings for update
  using (auth.uid() is not null)
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in (
      'housekeeper', 'cleaner', 'local_admin', 'super_admin'
    )
  );
