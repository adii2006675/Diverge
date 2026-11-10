-- Share links for Diverge timelines. Run this once in the Supabase SQL editor.
-- Each link is a frozen snapshot of a timeline, so later edits or rewinds never change what viewers see.
-- Rows can be created and deleted only by their owner. Anyone with a link's unguessable id can read that one snapshot
-- through get_shared_session(); the table itself cannot be listed or searched by visitors.

create table if not exists public.shared_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text,
  event_title text,
  what_ifs jsonb not null,
  divergence_score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint shared_sessions_what_ifs_is_array check (jsonb_typeof(what_ifs) = 'array' and jsonb_array_length(what_ifs) between 1 and 60),
  constraint shared_sessions_size check (pg_column_size(what_ifs) < 500000)
);

create index if not exists shared_sessions_user_idx on public.shared_sessions (user_id, created_at desc);

alter table public.shared_sessions enable row level security;

drop policy if exists "read own shares" on public.shared_sessions;
create policy "read own shares" on public.shared_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "create own shares" on public.shared_sessions;
create policy "create own shares" on public.shared_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "delete own shares" on public.shared_sessions;
create policy "delete own shares" on public.shared_sessions
  for delete using (auth.uid() = user_id);

-- Public read of a single snapshot by id. Never returns the owner's id.
create or replace function public.get_shared_session(p_id uuid)
returns table (event_id text, event_title text, what_ifs jsonb, divergence_score integer, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.event_id, s.event_title, s.what_ifs, s.divergence_score, s.created_at
    from public.shared_sessions s
   where s.id = p_id;
$$;

revoke all on function public.get_shared_session(uuid) from public;
grant execute on function public.get_shared_session(uuid) to anon, authenticated;
