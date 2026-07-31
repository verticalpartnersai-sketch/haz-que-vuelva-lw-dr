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
cli_version="${SUPABASE_CLI_VERSION:-2.111.0}"
database_url="${HQV_DATABASE_URL:-}"
passphrase="${HQV_BACKUP_PASSPHRASE:-}"

[[ "$output_file" == /* ]] || fail "output path must be absolute"
[[ "$output_file" == *.tar.gz.gpg ]] || fail "output must end in .tar.gz.gpg"
[[ "$output_file" != "$repo_root/"* ]] || fail "backup cannot be written inside the repository"
[[ ! -e "$output_file" ]] || fail "output already exists"
[[ -d "$(dirname "$output_file")" ]] || fail "output directory does not exist"
[[ -n "$database_url" ]] || fail "HQV_DATABASE_URL is required"
[[ "$database_url" == *"$project_ref"* ]] || fail "database URL does not match the production project ref"
[[ ${#passphrase} -ge 20 ]] || fail "HQV_BACKUP_PASSPHRASE must contain at least 20 characters"

for command_name in docker npx gpg tar shasum git; do
  command -v "$command_name" >/dev/null || fail "$command_name is unavailable"
done
docker info >/dev/null 2>&1 || fail "Docker is required by supabase db dump and is not running"

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

supabase_cli=(npx --yes "supabase@$cli_version")
"${supabase_cli[@]}" db dump --db-url "$database_url" -f "$temp_dir/roles.sql" --role-only
"${supabase_cli[@]}" db dump --db-url "$database_url" -f "$temp_dir/schema.sql"
"${supabase_cli[@]}" db dump \
  --db-url "$database_url" \
  -f "$temp_dir/data.sql" \
  --use-copy \
  --data-only \
  -x storage.buckets_vectors \
  -x storage.vector_indexes

created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
git_sha="$(git -C "$repo_root" rev-parse HEAD)"
cat >"$temp_dir/manifest.env" <<EOF
format=haz-que-vuelva-supabase-v1
created_at=$created_at
project_ref=$project_ref
git_sha=$git_sha
supabase_cli_version=$cli_version
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
