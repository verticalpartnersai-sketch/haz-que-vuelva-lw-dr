create extension if not exists pgcrypto with schema extensions;

create type public.member_role as enum ('member', 'admin');
create type public.grant_source as enum ('purchase', 'manual');
create type public.revocation_reason as enum (
  'cancelled',
  'refunded',
  'charged_back',
  'manual'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx
on public.profiles (lower(email));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    raise exception 'email_required';
  end if;

  insert into public.profiles (id, email)
  values (new.id, lower(new.email));

  return new;
end;
$$;

create trigger create_profile_after_auth_user
after insert on auth.users
for each row execute function public.handle_new_auth_user();

revoke all on function public.handle_new_auth_user() from public;

create table public.products (
  code text primary key,
  name text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_code_format check (code ~ '^[a-z0-9_]+$')
);

create table public.external_offers (
  id uuid primary key default extensions.gen_random_uuid(),
  provider text not null check (provider = 'perfect_pay'),
  external_product_code text not null,
  external_plan_code text not null,
  product_code text not null references public.products(code),
  checkout_url text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider, external_product_code, external_plan_code)
);

create table public.purchases (
  id uuid primary key default extensions.gen_random_uuid(),
  provider text not null check (provider = 'perfect_pay'),
  external_sale_code text not null,
  member_id uuid references public.profiles(id),
  customer_email text not null,
  status text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_sale_code)
);

create table public.purchase_items (
  id uuid primary key default extensions.gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_code text not null references public.products(code),
  external_product_code text not null,
  external_plan_code text not null,
  created_at timestamptz not null default now(),
  unique (purchase_id, product_code, external_product_code, external_plan_code)
);

create table public.access_grants (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  product_code text not null references public.products(code),
  source public.grant_source not null,
  source_reference text not null,
  granted_by uuid references public.profiles(id),
  reason text,
  granted_at timestamptz not null default now(),
  unique (member_id, product_code, source, source_reference),
  constraint manual_grant_has_reason check (
    source <> 'manual' or (reason is not null and length(trim(reason)) >= 8)
  )
);

create table public.access_revocations (
  id uuid primary key default extensions.gen_random_uuid(),
  grant_id uuid not null references public.access_grants(id) on delete cascade,
  reason public.revocation_reason not null,
  source_reference text not null,
  revoked_by uuid references public.profiles(id),
  detail text,
  revoked_at timestamptz not null default now(),
  unique (grant_id, source_reference)
);

insert into public.products (code, name, sort_order)
values
  ('haz_que_vuelva', 'Haz Que Vuelva', 10),
  ('21_mensajes', '21 Mensajes de Reconexión', 20),
  ('la_otra', 'La Otra', 30),
  ('reconquista_30', 'Reconquista 30', 40),
  ('vuelve_ia', 'Vuelve IA', 50);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace view public.effective_entitlements
with (security_invoker = true)
as
select
  grant_row.member_id,
  grant_row.product_code,
  min(grant_row.granted_at) as first_granted_at,
  count(*) filter (where revocation.id is null) as active_grant_count
from public.access_grants as grant_row
left join public.access_revocations as revocation on revocation.grant_id = grant_row.id
group by grant_row.member_id, grant_row.product_code
having count(*) filter (where revocation.id is null) > 0;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.external_offers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.access_grants enable row level security;
alter table public.access_revocations enable row level security;

create policy "member reads own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

create policy "member updates own display name"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = 'member');

create policy "authenticated reads active products"
on public.products for select to authenticated
using (active or (select public.is_admin()));

create policy "admin manages products"
on public.products for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admin manages offers"
on public.external_offers for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "member reads own purchases"
on public.purchases for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own purchase items"
on public.purchase_items for select to authenticated
using (
  exists (
    select 1 from public.purchases
    where purchases.id = purchase_items.purchase_id
      and (purchases.member_id = (select auth.uid()) or (select public.is_admin()))
  )
);

create policy "member reads own grants"
on public.access_grants for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own revocations"
on public.access_revocations for select to authenticated
using (
  exists (
    select 1 from public.access_grants
    where access_grants.id = access_revocations.grant_id
      and (
        access_grants.member_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

grant usage on schema public to authenticated;
grant select on public.products, public.profiles, public.purchases,
  public.purchase_items, public.access_grants, public.access_revocations,
  public.effective_entitlements to authenticated;
grant select, insert, update, delete on public.products,
  public.external_offers to authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;
