#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runner="$repo_root/scripts/run-supabase-contract-tests.sh"
temporary_directory="$(mktemp -d)"

cleanup() {
  rm -rf "$temporary_directory"
}
trap cleanup EXIT

if env -i PATH="$PATH" bash "$runner" \
  >"$temporary_directory/missing.out" 2>&1; then
  echo "contract runner accepted a missing target" >&2
  exit 1
fi
grep -Fq "HQV_SUPABASE_PROJECT_REF is required" \
  "$temporary_directory/missing.out"

if env -i \
  PATH="$PATH" \
  HQV_SUPABASE_PROJECT_REF="expected-project" \
  HQV_SUPABASE_TEST_CONFIRM="RUN_PGTAP:expected-project" \
  PGHOST="db.wrong-project.supabase.co" \
  PGDATABASE="postgres" \
  PGUSER="postgres" \
  PGPASSWORD="synthetic" \
  bash "$runner" >"$temporary_directory/wrong-target.out" 2>&1; then
  echo "contract runner accepted the wrong target" >&2
  exit 1
fi
grep -Fq "PGHOST does not identify the confirmed Supabase project" \
  "$temporary_directory/wrong-target.out"

echo "Supabase contract runner refusals passed."
