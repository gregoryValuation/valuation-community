-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- after creating the project. Sets up tables, row-level security, and the
-- storage bucket for uploaded Excel models.
--
-- (If you already ran an older version of this file, use
-- supabase/migration_002_profiles.sql instead — it adds the same things
-- incrementally without touching your existing data.)

-- ---------- profiles (usernames) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness: "JohnDoe" and "johndoe" count as the same
-- username.
create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up, reading the
-- username passed via signUp({ options: { data: { username } } }). If the
-- username is already taken, this raises a unique_violation, which aborts
-- the whole signup — no orphaned auth-only accounts with no username.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- tickers ----------
create table if not exists tickers (
  id uuid primary key default gen_random_uuid(),
  symbol text unique not null,
  created_at timestamptz not null default now()
);

alter table tickers enable row level security;

create policy "tickers are publicly readable"
  on tickers for select
  using (true);

create policy "authenticated users can create tickers"
  on tickers for insert
  to authenticated
  with check (true);

-- ---------- models ----------
create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  ticker_id uuid not null references tickers(id) on delete cascade,
  target_price numeric not null,
  horizon_months integer not null default 12,
  notes text,
  file_path text not null,
  original_filename text not null,
  created_at timestamptz not null default now()
);

alter table models enable row level security;

create policy "models are readable by signed-in users"
  on models for select
  to authenticated
  using (true);

create policy "users can upload their own models"
  on models for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can delete their own models"
  on models for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- storage bucket for the Excel files ----------
-- Private bucket: only signed-in users can read/write, via the policies
-- below. Files are keyed as "{user_id}/{uuid}-{original_filename}".
insert into storage.buckets (id, name, public)
values ('models', 'models', false)
on conflict (id) do nothing;

create policy "signed-in users can read model files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'models');

create policy "users can upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
