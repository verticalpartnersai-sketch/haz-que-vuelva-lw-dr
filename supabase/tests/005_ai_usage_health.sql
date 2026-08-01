begin;

select plan(3);

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
  '50000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ai-health@example.test',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.ai_generations (
  id,
  member_id,
  status,
  completed_at,
  provider_usage
)
values
  (
    '51000000-0000-0000-0000-000000000005',
    '50000000-0000-0000-0000-000000000005',
    'completed',
    now(),
    '{"model":"synthetic","prompt_tokens":100,"output_tokens":20,"total_tokens":120}'::jsonb
  ),
  (
    '52000000-0000-0000-0000-000000000005',
    '50000000-0000-0000-0000-000000000005',
    'completed',
    now(),
    '{}'::jsonb
  );

select is(
  (public.get_ai_usage_health(now() - interval '1 day') ->> 'completed_generations')::integer,
  2,
  'health includes completed generations in the window'
);
select is(
  (public.get_ai_usage_health(now() - interval '1 day') ->> 'total_tokens')::integer,
  120,
  'health sums valid provider token usage'
);
select is(
  (public.get_ai_usage_health(now() - interval '1 day') ->> 'missing_usage')::integer,
  1,
  'health reports completed generations without valid usage'
);

select * from finish();
rollback;
