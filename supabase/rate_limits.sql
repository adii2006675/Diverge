-- Request limits for Diverge that survive server restarts and work across servers. Run this once in the Supabase SQL editor.
-- The app calls hit_rate_limit() before spending money on a request. If this is not set up, the app falls back to a
-- weaker limit kept in the server's memory, so nothing breaks, it is just easier to get around.

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  expires_at timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

-- Nobody can read or change the table directly; it is only touched by the function below.
alter table public.rate_limits enable row level security;

-- Counts one request for this key in the current window. Returns true when the key is over its limit.
create or replace function public.hit_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.rate_limits (key, window_start, expires_at, hits)
  values (left(p_key, 200), w, w + make_interval(secs => p_window_seconds), 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into n;

  -- Now and then, clear out old windows.
  if random() < 0.02 then
    delete from public.rate_limits where expires_at < now() - interval '1 hour';
  end if;

  return n > p_max;
end;
$$;

grant execute on function public.hit_rate_limit(text, integer, integer) to anon, authenticated;
