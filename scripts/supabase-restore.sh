#!/usr/bin/env bash

set -euo pipefail
umask 077

fail() {
  echo "Restore refused: $1" >&2
  exit 1
}

[[ $# -ge 2 && $# -le 3 ]] ||
  fail "usage: scripts/supabase-restore.sh /absolute/path/backup.tar.gz.gpg <target-project-ref> [--execute]"

backup_file="$1"
target_ref="$2"
mode="${3:-}"
source_ref="${HQV_PRODUCTION_PROJECT_REF:-euaurfmlxornllntwmmh}"
passphrase="${HQV_BACKUP_PASSPHRASE:-}"

[[ -z "$mode" || "$mode" == "--execute" ]] || fail "unknown option: $mode"
[[ "$backup_file" == /* && -f "$backup_file" ]] || fail "backup must be an existing absolute path"
[[ "$target_ref" =~ ^[a-z0-9]{15,32}$ ]] || fail "target project ref has an invalid format"
[[ "$target_ref" != "$source_ref" ]] || fail "this drill never restores over the production project"
[[ ${#passphrase} -ge 20 ]] || fail "HQV_BACKUP_PASSPHRASE must contain at least 20 characters"

for command_name in gpg tar shasum sort grep awk; do
  command -v "$command_name" >/dev/null || fail "$command_name is unavailable"
done

temp_root="${TMPDIR:-/tmp}"
temp_dir="$(mktemp -d "$temp_root/hqv-restore.XXXXXX")"
archive_file="$temp_dir/backup.tar.gz"

cleanup() {
  if [[ -n "${temp_dir:-}" && -d "$temp_dir" && "$temp_dir" == "$temp_root/hqv-restore."* ]]; then
    rm -rf -- "$temp_dir"
  fi
}
trap cleanup EXIT

gpg \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 3 \
  --decrypt \
  --output "$archive_file" \
  "$backup_file" \
  3<<<"$passphrase"

archive_members="$(tar -tzf "$archive_file" | sort)"
expected_members=$'SHA256SUMS\ndata.sql\nmanifest.env\nroles.sql\nschema.sql'
[[ "$archive_members" == "$expected_members" ]] || fail "archive contains unexpected files"
tar -xzf "$archive_file" -C "$temp_dir"
(
  cd "$temp_dir"
  shasum -a 256 -c SHA256SUMS >/dev/null
)

grep -qx 'format=haz-que-vuelva-supabase-v1' "$temp_dir/manifest.env" || fail "unsupported backup format"
grep -qx "project_ref=$source_ref" "$temp_dir/manifest.env" || fail "backup source does not match production"
backup_sha="$(shasum -a 256 "$backup_file" | awk '{print $1}')"
printf 'Backup verified: %s\nTarget isolated project: %s\n' "$backup_sha" "$target_ref"

if [[ "$mode" != "--execute" ]]; then
  printf 'Plan only. No database connection was made and no state was changed.\n'
  printf 'Execution requires HQV_RESTORE_DATABASE_URL and HQV_RESTORE_CONFIRM.\n'
  exit 0
fi

command -v psql >/dev/null || fail "psql is unavailable"
database_url="${HQV_RESTORE_DATABASE_URL:-}"
expected_confirmation="RESTORE:$backup_sha:$target_ref"
[[ -n "$database_url" ]] || fail "HQV_RESTORE_DATABASE_URL is required"
[[ "$database_url" == *"$target_ref"* ]] || fail "restore URL does not match the isolated target ref"
[[ "$database_url" != *"$source_ref"* ]] || fail "production database URL is forbidden"
[[ "$database_url" == *"sslmode=require"* ]] || fail "restore URL must require TLS"
[[ "${HQV_RESTORE_CONFIRM:-}" == "$expected_confirmation" ]] ||
  fail "set HQV_RESTORE_CONFIRM exactly to $expected_confirmation"

target_is_empty="$(psql "$database_url" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command "select to_regclass('public.profiles') is null")"
[[ "$target_is_empty" == "t" ]] || fail "target already contains the HQV schema"

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file "$temp_dir/roles.sql" \
  --file "$temp_dir/schema.sql" \
  --command 'SET session_replication_role = replica' \
  --file "$temp_dir/data.sql" \
  --dbname "$database_url"

required_relations="$(psql "$database_url" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command "select count(*) from unnest(array['public.profiles','public.products','public.purchases','public.access_grants','public.content_items','public.ai_cases']) relation where to_regclass(relation) is not null")"
[[ "$required_relations" == "6" ]] || fail "post-restore relation verification failed"
printf 'Restore completed in isolated project %s. Storage objects still require separate recovery.\n' "$target_ref"
