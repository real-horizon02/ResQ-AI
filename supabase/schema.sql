-- ============================================================
-- ResQ AI — Supabase Schema Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lblcmzzwddpkynitugkc/sql
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text not null default 'citizen' check (role in ('citizen', 'volunteer', 'admin')),
  city text,
  state text,
  skills text[] default '{}',
  avatar_url text,
  admin_approved boolean not null default false,
  admin_request boolean not null default false,
  response_rate integer default 0,
  tasks_completed integer default 0,
  rating numeric(3,1) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Admin requests table
create table if not exists public.admin_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- 3. Row Level Security
alter table public.profiles enable row level security;
alter table public.admin_requests enable row level security;

-- Users can see their own profile
create policy if not exists "users_select_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can see all profiles
create policy if not exists "admins_select_all_profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Users can update their own profile
create policy if not exists "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile
create policy if not exists "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Admins can update all profiles (for approvals)
create policy if not exists "admins_update_all_profiles"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Admin requests: users see own request
create policy if not exists "users_select_own_request"
  on public.admin_requests for select
  using (auth.uid() = user_id);

-- Admin requests: admins see all
create policy if not exists "admins_select_all_requests"
  on public.admin_requests for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Users can insert their own request
create policy if not exists "users_insert_own_request"
  on public.admin_requests for insert
  with check (auth.uid() = user_id);

-- Admins can update requests
create policy if not exists "admins_update_requests"
  on public.admin_requests for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- 4. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_super boolean;
begin
  is_super := new.email = 'kshitijkumawat48@gmail.com';
  insert into public.profiles (id, full_name, email, role, admin_approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case when is_super then 'admin' else 'citizen' end,
    is_super
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
