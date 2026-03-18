create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      username = coalesce(public.profiles.username, excluded.username);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  budget text,
  gift_deadline timestamptz,
  join_code text not null unique,
  invite_slug uuid not null unique default gen_random_uuid(),
  phase text not null default 'setup' check (phase in ('setup', 'drawn', 'gifting', 'deadline_reached', 'guessing', 'revealed', 'archived')),
  draw_started_at timestamptz,
  revealed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.session_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create table if not exists public.session_assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  gifter_member_id uuid not null references public.session_members(id) on delete cascade,
  receiver_member_id uuid not null references public.session_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, gifter_member_id),
  unique (session_id, receiver_member_id),
  check (gifter_member_id <> receiver_member_id)
);

create table if not exists public.session_guesses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  guesser_user_id uuid not null references public.profiles(id) on delete cascade,
  target_member_id uuid not null references public.session_members(id) on delete cascade,
  guessed_gifter_member_id uuid not null references public.session_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, guesser_user_id, target_member_id)
);

create table if not exists public.session_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.session_assignments enable row level security;
alter table public.session_guesses enable row level security;
alter table public.session_scores enable row level security;

create policy "profiles_select_own_or_member"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.session_members sm_me
    join public.session_members sm_other on sm_other.session_id = sm_me.session_id
    where sm_me.user_id = auth.uid()
      and sm_other.user_id = profiles.id
  )
);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

create policy "sessions_select_for_members"
on public.sessions
for select
using (
  exists (
    select 1 from public.session_members sm
    where sm.session_id = sessions.id and sm.user_id = auth.uid()
  )
);

create policy "sessions_insert_authenticated"
on public.sessions
for insert
with check (auth.uid() = host_user_id);

create policy "sessions_update_host"
on public.sessions
for update
using (auth.uid() = host_user_id);

create policy "sessions_delete_host"
on public.sessions
for delete
using (auth.uid() = host_user_id);

create policy "session_members_select_members"
on public.session_members
for select
using (
  exists (
    select 1 from public.session_members sm
    where sm.session_id = session_members.session_id and sm.user_id = auth.uid()
  )
);

create policy "session_members_insert_self"
on public.session_members
for insert
with check (auth.uid() = user_id);

create policy "session_members_delete_host_or_self"
on public.session_members
for delete
using (
  auth.uid() = user_id or exists (
    select 1 from public.sessions s where s.id = session_members.session_id and s.host_user_id = auth.uid()
  )
);

create policy "assignments_select_members"
on public.session_assignments
for select
using (
  exists (
    select 1 from public.session_members sm
    where sm.session_id = session_assignments.session_id and sm.user_id = auth.uid()
  )
);

create policy "guesses_select_own"
on public.session_guesses
for select
using (guesser_user_id = auth.uid());

create policy "guesses_insert_own"
on public.session_guesses
for insert
with check (guesser_user_id = auth.uid());

create policy "guesses_delete_own"
on public.session_guesses
for delete
using (guesser_user_id = auth.uid());

create policy "scores_select_members"
on public.session_scores
for select
using (
  exists (
    select 1 from public.session_members sm
    where sm.session_id = session_scores.session_id and sm.user_id = auth.uid()
  )
);
