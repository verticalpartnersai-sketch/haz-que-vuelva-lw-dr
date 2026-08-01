begin;
select plan(12);

select ok(
  pg_get_functiondef(
    'public.consume_admin_reauthentication(text)'::regprocedure
  ) like '%public.is_admin()%'
  and pg_get_functiondef(
    'public.consume_admin_reauthentication(text)'::regprocedure
  ) not like '%admin_mfa_required%'
  and pg_get_functiondef(
    'public.consume_admin_reauthentication(text)'::regprocedure
  ) not like '%aal2%',
  'admin reauthentication is owner-only without mandatory MFA'
);

select ok(
  pg_get_functiondef(
    'public.is_admin()'::regprocedure
  ) like '%app_private.admin_principals%'
  and pg_get_functiondef(
    'public.is_admin()'::regprocedure
  ) like '%email_sha256%',
  'effective admin authorization requires the private owner allowlist'
);

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname ilike '%aal2%'
  ),
  'obsolete AAL2 policies are absent'
);

select ok(
  not has_schema_privilege('authenticated', 'app_private', 'usage'),
  'members cannot use the private authorization schema'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'app_private.admin_principals',
    'select'
  ),
  'members cannot read the private owner allowlist'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'app_private.admin_reauthentication_rate_limits',
    'select'
  )
  and not has_table_privilege(
    'service_role',
    'app_private.admin_reauthentication_rate_limits',
    'select'
  ),
  'rate-limit state has no direct table access'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.reserve_admin_reauthentication_attempt(uuid)',
    'execute'
  )
  and has_function_privilege(
    'service_role',
    'public.reserve_admin_reauthentication_attempt(uuid)',
    'execute'
  ),
  'only the backend service can reserve a password attempt'
);

select ok(
  pg_get_functiondef(
    'public.reserve_admin_reauthentication_attempt(uuid)'::regprocedure
  ) like '%pg_advisory_xact_lock%'
  and pg_get_functiondef(
    'public.reserve_admin_reauthentication_attempt(uuid)'::regprocedure
  ) like '%attempts >= 5%'
  and pg_get_functiondef(
    'public.reserve_admin_reauthentication_attempt(uuid)'::regprocedure
  ) like '%interval ''15 minutes''%',
  'password-attempt limiting is atomic and bounded'
);

select ok(
  pg_get_functiondef(
    'public.begin_admin_reauthentication(uuid,text)'::regprocedure
  ) like '%app_private.admin_principals%'
  and pg_get_functiondef(
    'public.begin_admin_reauthentication(uuid,text)'::regprocedure
  ) like '%delete from app_private.admin_reauthentication_rate_limits%',
  'successful owner reauthentication validates the allowlist and clears limits'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.update_product_with_reauthentication(text,text,text,boolean,integer,text)',
    'execute'
  ),
  'authenticated admins can invoke the protected product operation'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.upsert_external_offer_with_reauthentication(text,text,text,text,boolean,text)',
    'execute'
  ),
  'authenticated admins can invoke the protected offer operation'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.queue_member_invitation_with_reauthentication(uuid,text,uuid,text)',
    'execute'
  ),
  'authenticated admins can invoke the protected invitation operation'
);

select * from finish();
rollback;
