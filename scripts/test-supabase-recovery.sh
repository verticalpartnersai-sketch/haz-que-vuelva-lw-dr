#!/usr/bin/env bash

set -euo pipefail
umask 077

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temp_root="$(mktemp -d "${TMPDIR:-/tmp}/hqv-recovery-test.XXXXXX")"
fake_bin="$temp_root/bin"
backup_file="$temp_root/hqv-test.tar.gz.gpg"
source_ref="euaurfmlxornllntwmmh"
target_ref="abcdefghijklmnopqrst"
passphrase="synthetic-test-passphrase-2026"

cleanup() {
  if [[ -d "$temp_root" && "$temp_root" == "${TMPDIR:-/tmp}/hqv-recovery-test."* ]]; then
    rm -rf -- "$temp_root"
  fi
}
trap cleanup EXIT
mkdir -p "$fake_bin"

cat >"$fake_bin/docker" <<'EOF'
#!/usr/bin/env bash
[[ "${1:-}" == "info" ]]
EOF

cat >"$fake_bin/npx" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
output_file=""
while [[ $# -gt 0 ]]; do
  if [[ "$1" == "-f" ]]; then
    output_file="$2"
    break
  fi
  shift
done
[[ -n "$output_file" ]]
printf '%s\n' '-- synthetic Supabase recovery fixture' >"$output_file"
EOF

cat >"$fake_bin/psql" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
arguments="$*"
case "$arguments" in
  *"to_regclass('public.profiles') is null"*) printf 't\n' ;;
  *"select count(*) from unnest"*) printf '6\n' ;;
  *) exit 0 ;;
esac
EOF
chmod +x "$fake_bin/docker" "$fake_bin/npx" "$fake_bin/psql"

export PATH="$fake_bin:$PATH"
export HQV_PRODUCTION_PROJECT_REF="$source_ref"
export HQV_DATABASE_URL="postgresql://postgres.$source_ref:fake@localhost/postgres?sslmode=require"
export HQV_BACKUP_PASSPHRASE="$passphrase"

"$repo_root/scripts/supabase-backup.sh" "$backup_file" >/dev/null
[[ -s "$backup_file" ]]

"$repo_root/scripts/supabase-restore.sh" "$backup_file" "$target_ref" >/dev/null

set +e
"$repo_root/scripts/supabase-restore.sh" "$backup_file" "$source_ref" >/dev/null 2>&1
production_status=$?
set -e
[[ "$production_status" -ne 0 ]]

backup_sha="$(shasum -a 256 "$backup_file" | awk '{print $1}')"
export HQV_RESTORE_DATABASE_URL="postgresql://postgres.$target_ref:fake@localhost/postgres?sslmode=require"
export HQV_RESTORE_CONFIRM="RESTORE:$backup_sha:$target_ref"
"$repo_root/scripts/supabase-restore.sh" "$backup_file" "$target_ref" --execute >/dev/null

set +e
HQV_RESTORE_CONFIRM="wrong" \
  "$repo_root/scripts/supabase-restore.sh" "$backup_file" "$target_ref" --execute >/dev/null 2>&1
confirmation_status=$?
set -e
[[ "$confirmation_status" -ne 0 ]]

printf 'Supabase recovery scripts: synthetic backup, plan, restore and refusals passed.\n'
