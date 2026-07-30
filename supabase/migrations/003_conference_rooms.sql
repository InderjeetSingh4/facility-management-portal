-- ============================================================
-- Conference Room Booking System
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create tables
create table if not exists public.conference_rooms (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references public.plants(id) on delete cascade,
  name text not null,
  capacity integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.conference_rooms(id) on delete cascade,
  booked_by uuid references auth.users(id) on delete cascade,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  created_at timestamptz not null default now(),
  constraint time_order check (start_time < end_time)
);

-- 2. Enable RLS
alter table public.conference_rooms enable row level security;
alter table public.room_bookings enable row level security;

-- 3. RLS Policies

-- Anyone authenticated can view rooms
create policy "Authenticated users can view rooms"
  on public.conference_rooms for select
  using (auth.uid() is not null);

-- Anyone authenticated can view bookings
create policy "Authenticated users can view bookings"
  on public.room_bookings for select
  using (auth.uid() is not null);

-- Anyone authenticated can insert a booking
create policy "Authenticated users can book rooms"
  on public.room_bookings for insert
  with check (auth.uid() is not null and booked_by = auth.uid());

-- Users can only delete their own bookings
create policy "Users can delete own bookings"
  on public.room_bookings for delete
  using (booked_by = auth.uid());

-- Note: We also need some initial data to test with.
-- Here are some sample rooms for the first plant found.
insert into public.conference_rooms (plant_id, name, capacity)
select id, 'Boardroom Alpha', 12 from public.plants limit 1;

insert into public.conference_rooms (plant_id, name, capacity)
select id, 'Huddle Space Beta', 4 from public.plants limit 1;

insert into public.conference_rooms (plant_id, name, capacity)
select id, 'Training Room Omega', 30 from public.plants limit 1;
