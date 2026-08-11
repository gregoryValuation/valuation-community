-- Run this once in the Supabase SQL Editor (adds usernames on top of the
-- schema.sql you already ran). Safe to run even though tickers/models
-- already exist — this only adds new things and backfills.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness: "JohnDoe" and "johndoe" count as the same
-- username, so one can't be taken while a lookalike is still free.
create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

alter table profiles enable row level security;

drop policy if exists "profiles are publicly readable" on profiles;
create policy "profiles are publicly readable"
  on profiles for select
  to authenticated
  using (true);

drop policy if exists "users can update their own profile" on profiles;
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill a profile for any account created before this migration (like
-- your existing test account) — username defaults to the email prefix
-- since they were never asked to choose one.
insert into profiles (id, username)
select id, split_part(email, '@', 1)
from auth.users
where id not in (select id from profiles)
on conflict (id) do nothing;

-- Re-point models.user_id at profiles instead of auth.users directly, so
-- a query on models can embed the uploader's username in one round trip.
alter table models drop constraint if exists models_user_id_fkey;
alter table models
  add constraint models_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
