#!/usr/bin/env bash
set -euo pipefail

project_ref="${HQV_SUPABASE_PROJECT_REF:-}"
confirmation="${HQV_SUPABASE_TEST_CONFIRM:-}"
database_host="${PGHOST:-}"
database_name="${PGDATABASE:-}"

if [[ -z "$project_ref" ]]; then
  echo "HQV_SUPABASE_PROJECT_REF is required" >&2
  exit 1
fi

if [[ "$confirmation" != "RUN_PGTAP:${project_ref}" ]]; then
  echo "HQV_SUPABASE_TEST_CONFIRM must equal RUN_PGTAP:${project_ref}" >&2
  exit 1
fi

if [[ -z "$database_host" || "$database_host" != *"${project_ref}"* ]]; then
  echo "PGHOST does not identify the confirmed Supabase project" >&2
  exit 1
fi

if [[ "$database_name" != "postgres" ]]; then
  echo "PGDATABASE must be postgres" >&2
  exit 1
fi

if [[ -z "${PGUSER:-}" || -z "${PGPASSWORD:-}" ]]; then
  echo "PGUSER and PGPASSWORD are required" >&2
  exit 1
fi

command -v psql >/dev/null || {
  echo "psql is required" >&2
  exit 1
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_directory="$repo_root/supabase/tests"
temporary_directory="$(mktemp -d)"
psql_command=(psql --no-password --set=ON_ERROR_STOP=1 --set=QUIET=1)
pgtap_preexisting=""

cleanup() {
  local exit_status=$?
  trap - EXIT
  if [[ "$pgtap_preexisting" == "f" ]]; then
    "${psql_command[@]}" --command "drop extension if exists pgtap" \
      >/dev/null 2>&1 || true
  fi
  rm -rf "$temporary_directory"
  exit "$exit_status"
}
trap cleanup EXIT

latest_migration="$(
  "${psql_command[@]}" --tuples-only --no-align --command \
    "select max(version) from supabase_migrations.schema_migrations"
)"
if [[ "$latest_migration" != "202608010030" ]]; then
  echo "unexpected Supabase migration head: ${latest_migration:-missing}" >&2
  exit 1
fi

pgtap_preexisting="$(
  "${psql_command[@]}" --tuples-only --no-align --command \
    "select exists(select 1 from pg_extension where extname = 'pgtap')"
)"
"${psql_command[@]}" --command \
  "create extension if not exists pgtap with schema extensions" >/dev/null

assertion_count=0
test_count=0

for test_file in "$test_directory"/[0-9][0-9][0-9]_*.sql; do
  test_name="$(basename "$test_file")"
  test_log="$temporary_directory/${test_name}.log"

  PGOPTIONS="-c search_path=public,extensions" \
    "${psql_command[@]}" --file "$test_file" >"$test_log"

  if grep -Eq 'not ok|Bail out|# Failed test' "$test_log"; then
    echo "Supabase contract failed: $test_name" >&2
    sed -n '/not ok\|Bail out\|# Failed test/p' "$test_log" >&2
    exit 1
  fi

  file_assertions="$(grep -Ec '^[[:space:]]+ok [0-9]+ - ' "$test_log" || true)"
  if [[ "$file_assertions" -eq 0 ]]; then
    echo "Supabase contract produced no passing assertions: $test_name" >&2
    exit 1
  fi

  assertion_count=$((assertion_count + file_assertions))
  test_count=$((test_count + 1))
  echo "passed: $test_name ($file_assertions assertions)"
done

synthetic_profiles="$(
  "${psql_command[@]}" --tuples-only --no-align --command \
    "select count(*) from public.profiles where email like '%@example.test'"
)"
if [[ "$synthetic_profiles" != "0" ]]; then
  echo "synthetic test profiles remain in the target database" >&2
  exit 1
fi

echo "Supabase Cloud contracts passed: $test_count files, $assertion_count assertions."
