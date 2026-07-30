create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    raise exception 'email_required';
  end if;

  if lower(new.email) is distinct from lower(old.email) then
    update public.profiles
    set
      email = lower(new.email),
      updated_at = now()
    where id = new.id;

    if not found then
      raise exception 'profile_not_found';
    end if;

    insert into public.audit_log (
      actor_id,
      action,
      target_type,
      target_id,
      reason
    )
    values (
      new.id,
      'identity.email_changed',
      'profile',
      new.id::text,
      'Secure email change confirmed'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_after_auth_email_change on auth.users;
create trigger sync_profile_after_auth_email_change
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_profile_email_from_auth();

revoke all on function public.sync_profile_email_from_auth()
from public, anon, authenticated;
