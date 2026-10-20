-- Free-question allowance for Diverge. Run this once in the Supabase SQL editor.
-- Each signed-in user gets 2 questions on the app owner's API key; after that they add their own key.
-- The count can only change through the functions below (it cannot be edited from the browser).

create table if not exists public.usage_counts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_used integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.usage_counts enable row level security;

drop policy if exists "read own usage" on public.usage_counts;
create policy "read own usage" on public.usage_counts
  for select using (auth.uid() = user_id);

-- Atomically uses one free question if any remain. Returns whether it was allowed and how many are used.
create or replace function public.consume_free_question(limit_count integer default 2)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n integer;
begin
  if uid is null then
    return query select false, 0;
    return;
  end if;

  insert into public.usage_counts (user_id, free_used) values (uid, 0)
  on conflict (user_id) do nothing;

  update public.usage_counts
     set free_used = free_used + 1, updated_at = now()
   where user_id = uid and free_used < limit_count
  returning free_used into n;

  if n is null then
    select free_used into n from public.usage_counts where user_id = uid;
    return query select false, coalesce(n, 0);
  else
    return query select true, n;
  end if;
end;
$$;

-- Gives a free question back when generation fails after one was used.
create or replace function public.refund_free_question()
returns void
language sql
security definer
set search_path = public
as $$
  update public.usage_counts
     set free_used = greatest(free_used - 1, 0), updated_at = now()
   where user_id = auth.uid();
$$;

revoke all on function public.consume_free_question(integer) from public, anon;
revoke all on function public.refund_free_question() from public, anon;
grant execute on function public.consume_free_question(integer) to authenticated;
grant execute on function public.refund_free_question() to authenticated;
