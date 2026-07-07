-- Run this whole file once in your Supabase project's SQL editor.
-- Dashboard: Project -> SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null check (role in ('user','cook')) default 'user',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles are viewable by everyone"
  on profiles for select using (true);

create policy "users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ---------- menu (one row per date + meal) ----------
create table if not exists menu (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  description text not null default '',
  updated_by uuid references profiles(id),
  updated_at timestamptz default now(),
  unique (date, meal_type)
);

alter table menu enable row level security;

create policy "menu is viewable by everyone"
  on menu for select using (true);

create policy "only cooks can insert menu"
  on menu for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'cook')
  );

create policy "only cooks can update menu"
  on menu for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'cook')
  );

-- ---------- responses (one row per user + date + meal) ----------
create table if not exists responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  response text not null check (response in ('yes','no')),
  reason text,
  created_at timestamptz default now(),
  unique (user_id, date, meal_type)
);

alter table responses enable row level security;

create policy "users see own responses, cooks see all"
  on responses for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'cook')
  );

create policy "users insert their own responses"
  on responses for insert with check (auth.uid() = user_id);

create policy "users update their own responses"
  on responses for update using (auth.uid() = user_id);

-- ---------- realtime ----------
-- Enables the live "menu updated" notification and live head-count refresh.
alter publication supabase_realtime add table menu;
alter publication supabase_realtime add table responses;
