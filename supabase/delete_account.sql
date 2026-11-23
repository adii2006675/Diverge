-- Lets a signed-in person delete their own account and everything attached to it. Run this once in the Supabase SQL editor.
-- It only ever acts on the caller (auth.uid()), so nobody can delete anyone else's data.
-- Profile pictures are removed by the app itself before it calls this.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  delete from public.shared_sessions where user_id = uid;
  delete from public.sessions where user_id = uid;
  delete from public.user_settings where id = uid;
  delete from public.profiles where id = uid;
  delete from public.usage_counts where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
