#!/usr/bin/env node

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const verifier = path.resolve("scripts/check-supabase-migrations.mjs");
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "hqv-sql-check-"));

const baseline = `
revoke usage on schema public from public, anon;
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
`;

const validFoundation = `
create table public.example_records (id uuid primary key);
alter table public.example_records enable row level security;

create or replace function public.example_guard()
returns boolean
language sql
security definer
set search_path = ''
as $$ select true $$;

revoke all on function public.example_guard() from public;
${baseline}
`;

async function runCase(name, files, expectedStatus, expectedMessage) {
  const directory = path.join(temporaryRoot, name);
  await mkdir(directory);

  for (const [fileName, sql] of Object.entries(files)) {
    await writeFile(path.join(directory, fileName), sql);
  }

  const result = spawnSync(process.execPath, [verifier, directory], {
    encoding: "utf8",
  });
  const output = `${result.stdout}${result.stderr}`;

  if (result.status !== expectedStatus || !output.includes(expectedMessage)) {
    throw new Error(
      `${name} failed expectation\nstatus=${result.status}\noutput=${output}`,
    );
  }
}

try {
  await runCase(
    "valid",
    { "202601010001_foundation.sql": validFoundation },
    0,
    "security check passed",
  );

  await runCase(
    "missing-rls",
    {
      "202601010001_foundation.sql": validFoundation,
      "202601010002_unsafe_table.sql":
        "create table public.unprotected_records (id uuid primary key);",
    },
    1,
    "table is created without enabling RLS",
  );

  await runCase(
    "missing-search-path",
    {
      "202601010001_foundation.sql": validFoundation,
      "202601010002_unsafe_function.sql": `
        create or replace function public.unsafe_guard()
        returns boolean language sql security definer
        as $$ select true $$;
        revoke all on function public.unsafe_guard() from public;
      `,
    },
    1,
    "SECURITY DEFINER without a fixed search_path",
  );

  await runCase(
    "anonymous-grant",
    {
      "202601010001_foundation.sql": validFoundation,
      "202601010002_unsafe_grant.sql":
        "grant select on public.example_records to anon;",
    },
    1,
    "anonymous grants are forbidden after baseline",
  );

  console.log("Supabase migration verifier tests passed (4 cases).");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
