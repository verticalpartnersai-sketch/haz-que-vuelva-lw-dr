begin;

select plan(8);

select is(
  (
    select count(*)::integer
    from public.profiles as profile
    join app_private.admin_principals as principal
      on principal.email_sha256 = encode(
        extensions.digest(lower(trim(profile.email)), 'sha256'),
        'hex'
      )
    where profile.role = 'admin'
  ),
  1,
  'exactly one profile matches the private owner allowlist'
);

do $$
declare
  owner_claims text;
begin
  select jsonb_build_object(
    'sub', profile.id,
    'role', 'service_role'
  )::text
  into owner_claims
  from public.profiles as profile
  join app_private.admin_principals as principal
    on principal.email_sha256 = encode(
      extensions.digest(lower(trim(profile.email)), 'sha256'),
      'hex'
    )
  where profile.role = 'admin';

  perform set_config('request.jwt.claims', owner_claims, true);
end;
$$;

select public.begin_admin_reauthentication(
  auth.uid(),
  repeat('a', 64)
);

do $$
begin
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', auth.uid(),
      'role', 'authenticated'
    )::text,
    true
  );
end;
$$;

select ok(
  public.is_admin(),
  'the allowlisted owner receives effective admin authorization'
);

set local role authenticated;

select lives_ok(
  $$
    select public.update_product_with_reauthentication(
      code,
      name,
      coalesce(description, ''),
      active,
      sort_order,
      repeat('a', 64)
    )
    from public.products
    where code = 'haz_que_vuelva'
  $$,
  'the allowlisted owner can execute a critical admin mutation'
);

reset role;

select is(
  (
    select count(*)::integer
    from public.admin_reauthentication_sessions
    where actor_id = auth.uid()
      and token_hash = repeat('a', 64)
  ),
  0,
  'the critical mutation consumes the short-lived token exactly once'
);

set local role authenticated;

select throws_ok(
  $$
    select public.update_product_with_reauthentication(
      code,
      name,
      coalesce(description, ''),
      active,
      sort_order,
      repeat('a', 64)
    )
    from public.products
    where code = 'haz_que_vuelva'
  $$,
  '42501',
  'admin_reauthentication_required',
  'the consumed token cannot be replayed'
);

reset role;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '92000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'outside-owner@example.test',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

update public.profiles
set role = 'admin'
where id = '92000000-0000-0000-0000-000000000006';

do $$
begin
  perform set_config(
    'request.jwt.claims',
    '{"sub":"92000000-0000-0000-0000-000000000006","role":"authenticated"}',
    true
  );
end;
$$;

set local role authenticated;

select ok(
  not public.is_admin(),
  'an admin-shaped profile outside the allowlist is not an administrator'
);

select throws_ok(
  $$
    select public.update_product_with_reauthentication(
      code,
      name,
      coalesce(description, ''),
      active,
      sort_order,
      repeat('b', 64)
    )
    from public.products
    where code = 'haz_que_vuelva'
  $$,
  '42501',
  'admin_role_required',
  'an admin-shaped profile cannot execute a critical mutation'
);

reset role;

do $$
begin
  perform set_config(
    'request.jwt.claims',
    '{"sub":"92000000-0000-0000-0000-000000000006","role":"service_role"}',
    true
  );
end;
$$;

select throws_ok(
  $$
    select public.begin_admin_reauthentication(
      '92000000-0000-0000-0000-000000000006',
      repeat('b', 64)
    )
  $$,
  '42501',
  'admin_principal_not_allowed',
  'the backend cannot create a reauthentication token for an unlisted profile'
);

select * from finish();
rollback;
