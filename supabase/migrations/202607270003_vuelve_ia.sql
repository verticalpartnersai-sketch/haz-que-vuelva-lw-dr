create extension if not exists vector with schema extensions;

create type public.ai_case_status as enum ('active', 'reset');
create type public.ai_message_role as enum ('member', 'assistant');
create type public.ai_generation_status as enum (
  'reserved',
  'streaming',
  'completed',
  'failed',
  'cancelled'
);

create table public.ai_cases (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null unique references public.profiles(id) on delete cascade,
  status public.ai_case_status not null default 'active',
  created_at timestamptz not null default now(),
  reset_at timestamptz
);

create table public.ai_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  case_id uuid not null references public.ai_cases(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.ai_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_credit_lots (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  purchase_item_id uuid not null unique references public.purchase_items(id),
  credits_total integer not null default 30 check (credits_total > 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_generations (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  status public.ai_generation_status not null default 'reserved',
  reserved_at timestamptz not null default now(),
  completed_at timestamptz,
  provider_usage jsonb not null default '{}'::jsonb
);

create table public.ai_credit_consumptions (
  id uuid primary key default extensions.gen_random_uuid(),
  generation_id uuid not null unique references public.ai_generations(id) on delete cascade,
  credit_lot_id uuid not null references public.ai_credit_lots(id),
  consumed_at timestamptz not null default now()
);

create table public.ai_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('global', 'member')),
  title text not null,
  storage_path text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint document_scope_owner check (
    (scope = 'global' and owner_id is null)
    or (scope = 'member' and owner_id is not null)
  )
);

create table public.ai_chunks (
  id uuid primary key default extensions.gen_random_uuid(),
  document_id uuid not null references public.ai_documents(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  search_vector tsvector generated always as (
    to_tsvector('simple', content)
  ) stored,
  embedding extensions.vector(768),
  created_at timestamptz not null default now()
);

create index ai_chunks_search_idx on public.ai_chunks using gin (search_vector);
create index ai_chunks_embedding_idx
on public.ai_chunks using hnsw (embedding vector_cosine_ops);

create table public.ai_prompt_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  version integer not null unique,
  prompt text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  retired_at timestamptz
);

alter table public.ai_cases enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_credit_lots enable row level security;
alter table public.ai_generations enable row level security;
alter table public.ai_credit_consumptions enable row level security;
alter table public.ai_documents enable row level security;
alter table public.ai_chunks enable row level security;
alter table public.ai_prompt_versions enable row level security;

create policy "member owns case"
on public.ai_cases for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member owns conversations"
on public.ai_conversations for select to authenticated
using (
  exists (
    select 1 from public.ai_cases
    where ai_cases.id = ai_conversations.case_id
      and (ai_cases.member_id = (select auth.uid()) or (select public.is_admin()))
  )
);

create policy "member owns messages"
on public.ai_messages for select to authenticated
using (
  exists (
    select 1
    from public.ai_conversations
    join public.ai_cases on ai_cases.id = ai_conversations.case_id
    where ai_conversations.id = ai_messages.conversation_id
      and (ai_cases.member_id = (select auth.uid()) or (select public.is_admin()))
  )
);

create policy "member reads own credits"
on public.ai_credit_lots for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own generations"
on public.ai_generations for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own documents"
on public.ai_documents for select to authenticated
using (
  (scope = 'member' and owner_id = (select auth.uid()))
  or (select public.is_admin())
);

create policy "member reads own chunks"
on public.ai_chunks for select to authenticated
using (
  owner_id = (select auth.uid())
  or (select public.is_admin())
);

create policy "admin manages prompts"
on public.ai_prompt_versions for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.ai_cases, public.ai_conversations, public.ai_messages,
  public.ai_credit_lots, public.ai_generations, public.ai_documents,
  public.ai_chunks, public.ai_prompt_versions to authenticated;
