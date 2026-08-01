create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;

create table if not exists app_private.admin_principals (
  email_sha256 text primary key
    check (email_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

revoke all on table app_private.admin_principals
from public, anon, authenticated;

insert into app_private.admin_principals (email_sha256)
values ('5c7b52d6d4f077e6b2d2d43d6fa42bfc0c218a4792cac1d7319be7caede15333')
on conflict (email_sha256) do nothing;

update public.profiles as profile
set role = 'member', updated_at = now()
where profile.role = 'admin'
  and not exists (
    select 1
    from app_private.admin_principals as principal
    where principal.email_sha256 = encode(
      extensions.digest(lower(trim(profile.email)), 'sha256'),
      'hex'
    )
  );

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    join app_private.admin_principals as principal
      on principal.email_sha256 = encode(
        extensions.digest(lower(trim(profile.email)), 'sha256'),
        'hex'
      )
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  );
$$;

create or replace function public.promote_admin_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(p_email));
  profile_id uuid;
begin
  if not exists (
    select 1
    from app_private.admin_principals as principal
    where principal.email_sha256 = encode(
      extensions.digest(normalized_email, 'sha256'),
      'hex'
    )
  ) then
    raise exception 'admin_principal_not_allowed' using errcode = '42501';
  end if;

  update public.profiles
  set role = 'member', updated_at = now()
  where role = 'admin'
    and lower(email) <> normalized_email;

  update public.profiles
  set role = 'admin', updated_at = now()
  where lower(email) = normalized_email
  returning id into profile_id;

  if profile_id is null then
    raise exception 'profile not found';
  end if;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    reason
  )
  values (
    null,
    'identity.admin_promoted_by_command',
    'profile',
    profile_id::text,
    'Owner-only bootstrap command executed from trusted environment'
  );

  return profile_id;
end;
$$;

revoke all on function public.is_admin()
from public, anon;
grant execute on function public.is_admin()
to authenticated, service_role;

revoke all on function public.promote_admin_by_email(text)
from public, anon, authenticated;
grant execute on function public.promote_admin_by_email(text)
to service_role;
