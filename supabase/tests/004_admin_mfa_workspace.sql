begin;
select plan(8);

select ok(
  pg_get_functiondef(
    'public.consume_admin_reauthentication(text)'::regprocedure
  ) like '%admin_mfa_required%',
  'admin reauthentication consumption requires MFA'
);

select ok(
  pg_get_functiondef(
    'public.consume_admin_reauthentication(text)'::regprocedure
  ) like '%aal2%',
  'admin reauthentication consumption requires AAL2'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'admin cross profile reads require aal2'
      and permissive = 'RESTRICTIVE'
  ),
  'cross-profile reads have a restrictive MFA policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'purchases'
      and policyname = 'admin cross purchase reads require aal2'
      and permissive = 'RESTRICTIVE'
  ),
  'cross-purchase reads have a restrictive MFA policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'access_grants'
      and policyname = 'admin cross grant reads require aal2'
      and permissive = 'RESTRICTIVE'
  ),
  'cross-grant reads have a restrictive MFA policy'
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
