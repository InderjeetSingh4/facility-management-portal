-- ============================================================
-- Web Push Subscriptions Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can manage own subscriptions" on public.push_subscriptions;

create policy "Users can manage own subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
