#!/usr/bin/env bash

set -euo pipefail
umask 077

fail() {
  echo "Backup refused: $1" >&2
  exit 1
}

[[ $# -eq 1 ]] || fail "usage: scripts/supabase-backup.sh /absolute/path/backup.tar.gz.gpg"

output_file="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project_ref="${HQV_PRODUCTION_PROJECT_REF:-euaurfmlxornllntwmmh}"
database_url="${HQV_DATABASE_URL:-}"
passphrase="${HQV_BACKUP_PASSPHRASE:-}"

[[ "$output_file" == /* ]] || fail "output path must be absolute"
[[ "$output_file" == *.tar.gz.gpg ]] || fail "output must end in .tar.gz.gpg"
[[ "$output_file" != "$repo_root/"* ]] || fail "backup cannot be written inside the repository"
[[ ! -e "$output_file" ]] || fail "output already exists"
[[ -d "$(dirname "$output_file")" ]] || fail "output directory does not exist"
[[ -n "$database_url" ]] || fail "HQV_DATABASE_URL is required"
[[ "$database_url" == *"$project_ref"* ]] || fail "database URL does not match the production project ref"
[[ "$database_url" == *"sslmode=require"* ]] || fail "database URL must require TLS"
[[ ${#passphrase} -ge 20 ]] || fail "HQV_BACKUP_PASSPHRASE must contain at least 20 characters"

for command_name in pg_dump pg_dumpall psql sed uniq gpg tar shasum git; do
  command -v "$command_name" >/dev/null || fail "$command_name is unavailable"
done

temp_root="${TMPDIR:-/tmp}"
temp_dir="$(mktemp -d "$temp_root/hqv-backup.XXXXXX")"
partial_output="$output_file.partial.$$"

cleanup() {
  if [[ -n "${temp_dir:-}" && -d "$temp_dir" && "$temp_dir" == "$temp_root/hqv-backup."* ]]; then
    rm -rf -- "$temp_dir"
  fi
  if [[ -n "${partial_output:-}" && -f "$partial_output" && "$partial_output" == "$output_file.partial."* ]]; then
    rm -f -- "$partial_output"
  fi
}
trap cleanup EXIT

psql --dbname "$database_url" --set=ON_ERROR_STOP=1 --quiet --command 'select 1' >/dev/null

pg_dumpall \
  --dbname "$database_url" \
  --roles-only \
  --role postgres \
  --quote-all-identifiers \
  --no-role-passwords \
  --no-comments \
  | sed -E 's/^\\(un)?restrict .*$/-- &/' \
  | sed -E 's/^CREATE ROLE "(anon|authenticated|authenticator|cli_login_.*|dashboard_user|pgbouncer|postgres|service_role|supabase_.*|pgsodium_keyholder|pgsodium_keyiduser|pgsodium_keymaker|pgtle_admin)"/-- &/' \
  | sed -E 's/^ALTER ROLE "(anon|authenticated|authenticator|cli_login_.*|dashboard_user|pgbouncer|postgres|service_role|supabase_.*|pgsodium_keyholder|pgsodium_keyiduser|pgsodium_keymaker|pgtle_admin)"/-- &/' \
  | sed -E 's/ (NOSUPERUSER|NOREPLICATION)//g' \
  | sed -E 's/^-- (.* SET "(pgaudit.*|pgrst.*|session_replication_role|statement_timeout|track_io_timing)" .*)/\1/' \
  | sed -E 's/GRANT ".*" TO "(anon|authenticated|authenticator|cli_login_.*|dashboard_user|pgbouncer|postgres|service_role|supabase_.*|pgsodium_keyholder|pgsodium_keyiduser|pgsodium_keymaker|pgtle_admin)"/-- &/' \
  | sed -E '/^--/d' \
  | uniq >"$temp_dir/roles.sql"
printf 'RESET ALL;\n' >>"$temp_dir/roles.sql"

internal_schema_pattern='information_schema|pg_*|_analytics|_realtime|_supavisor|auth|etl|extensions|pgbouncer|realtime|storage|supabase_functions|supabase_migrations|cron|dbdev|graphql|graphql_public|net|pgmq|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault'
pg_dump \
  --dbname "$database_url" \
  --schema-only \
  --quote-all-identifiers \
  --role postgres \
  --exclude-schema "$internal_schema_pattern" \
  | sed -E 's/^\\(un)?restrict .*$/-- &/' \
  | sed -E 's/^CREATE SCHEMA "/CREATE SCHEMA IF NOT EXISTS "/' \
  | sed -E 's/^CREATE TABLE "/CREATE TABLE IF NOT EXISTS "/' \
  | sed -E 's/^CREATE SEQUENCE "/CREATE SEQUENCE IF NOT EXISTS "/' \
  | sed -E 's/^CREATE VIEW "/CREATE OR REPLACE VIEW "/' \
  | sed -E 's/^CREATE FUNCTION "/CREATE OR REPLACE FUNCTION "/' \
  | sed -E 's/^CREATE TRIGGER "/CREATE OR REPLACE TRIGGER "/' \
  | sed -E 's/^CREATE PUBLICATION "supabase_realtime/-- &/' \
  | sed -E 's/^CREATE EVENT TRIGGER /-- &/' \
  | sed -E 's/^         WHEN TAG IN /-- &/' \
  | sed -E 's/^   EXECUTE FUNCTION /-- &/' \
  | sed -E 's/^ALTER EVENT TRIGGER /-- &/' \
  | sed -E 's/^ALTER PUBLICATION "supabase_realtime_/-- &/' \
  | sed -E 's/^ALTER FOREIGN DATA WRAPPER (.+) OWNER TO /-- &/' \
  | sed -E 's/^ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin"/-- &/' \
  | sed -E 's/^GRANT ALL ON FOREIGN DATA WRAPPER (.+) TO "postgres" WITH GRANT OPTION/-- &/' \
  | sed -E "s/^GRANT (.+) ON (.+) \"($internal_schema_pattern)\"/-- &/" \
  | sed -E "s/^REVOKE (.+) ON (.+) \"($internal_schema_pattern)\"/-- &/" \
  | sed -E 's/^(CREATE EXTENSION IF NOT EXISTS "pg_tle").+/\1;/' \
  | sed -E 's/^(CREATE EXTENSION IF NOT EXISTS "pgsodium").+/\1;/' \
  | sed -E 's/^(CREATE EXTENSION IF NOT EXISTS "pgmq").+/\1;/' \
  | sed -E 's/^COMMENT ON EXTENSION (.+)/-- &/' \
  | sed -E 's/^CREATE POLICY "cron_job_/-- &/' \
  | sed -E 's/^ALTER TABLE "cron"/-- &/' \
  | sed -E 's/^SET transaction_timeout = 0;/-- &/' \
  | sed -E '/^--/d' >"$temp_dir/schema.sql"

data_internal_schema_pattern='information_schema|pg_*|graphql|graphql_public|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault|etl|extensions|pgbouncer|realtime|supabase_migrations|_analytics|_realtime|_supavisor'
printf 'SET session_replication_role = replica;\n\n' >"$temp_dir/data.sql"
pg_dump \
  --dbname "$database_url" \
  --data-only \
  --quote-all-identifiers \
  --role postgres \
  --exclude-schema "$data_internal_schema_pattern" \
  --exclude-table auth.schema_migrations \
  --exclude-table storage.migrations \
  --exclude-table supabase_functions.migrations \
  --exclude-table storage.buckets_vectors \
  --exclude-table storage.vector_indexes \
  --schema '*' \
  | sed -E 's/^\\(un)?restrict .*$/-- &/' >>"$temp_dir/data.sql"
printf 'RESET ALL;\n' >>"$temp_dir/data.sql"

created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
git_sha="$(git -C "$repo_root" rev-parse HEAD)"
cat >"$temp_dir/manifest.env" <<EOF
format=haz-que-vuelva-supabase-v1
created_at=$created_at
project_ref=$project_ref
git_sha=$git_sha
pg_dump_version=$(pg_dump --version | awk '{print $3}')
storage_objects_included=false
EOF

(
  cd "$temp_dir"
  shasum -a 256 roles.sql schema.sql data.sql manifest.env >SHA256SUMS
  tar -czf - roles.sql schema.sql data.sql manifest.env SHA256SUMS
) | gpg \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 3 \
  --symmetric \
  --cipher-algo AES256 \
  --s2k-digest-algo SHA512 \
  --s2k-mode 3 \
  --s2k-count 65011712 \
  --output "$partial_output" \
  3<<<"$passphrase"

chmod 600 "$partial_output"
mv "$partial_output" "$output_file"
backup_sha="$(shasum -a 256 "$output_file" | awk '{print $1}')"
printf 'Encrypted backup created: %s\nSHA-256: %s\n' "$output_file" "$backup_sha"
printf 'Storage objects are not included; execute the separate Storage export runbook.\n'
