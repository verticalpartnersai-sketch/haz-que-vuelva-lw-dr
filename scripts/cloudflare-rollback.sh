#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/cloudflare-rollback.sh <marketing|members|agent> <version-id> [--execute]

Without --execute, validates the target and lists current deployments only.
Production execution also requires:
  HQV_ROLLBACK_CONFIRM='<worker-name>:<version-id>'
EOF
}

fail() {
  echo "Rollback refused: $1" >&2
  exit 1
}

[[ $# -ge 2 && $# -le 3 ]] || {
  usage
  exit 2
}

target="$1"
version_id="$2"
mode="${3:-}"
[[ -z "$mode" || "$mode" == "--execute" ]] || fail "unknown option: $mode"
[[ "$version_id" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] ||
  fail "version ID must be a lowercase UUID"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
environment_name=""

case "$target" in
  marketing)
    worker_name="haz-que-vuelva-marketing"
    app_dir="$repo_root/apps/marketing"
    ;;
  members)
    worker_name="haz-que-vuelva-members"
    app_dir="$repo_root/apps/web"
    environment_name="production"
    ;;
  agent)
    worker_name="haz-que-vuelva-agent"
    app_dir="$repo_root/apps/agent"
    ;;
  *)
    fail "unknown target: $target"
    ;;
esac

command -v npx >/dev/null || fail "npx is unavailable"

wrangler() {
  if [[ -n "$environment_name" ]]; then
    npx wrangler "$@" --env "$environment_name"
  else
    npx wrangler "$@"
  fi
}

echo "Target Worker: $worker_name"
echo "Requested version: $version_id"
versions_json="$(
  cd "$app_dir"
  wrangler versions list --name "$worker_name" --json
)"
node -e '
  const versions = JSON.parse(process.argv[1]);
  const expected = process.argv[2];
  if (!Array.isArray(versions) || !versions.some((version) => version.id === expected)) {
    process.exit(1);
  }
' "$versions_json" "$version_id" || fail "version is not among the recoverable Worker versions"

(
  cd "$app_dir"
  wrangler deployments list --name "$worker_name"
)

if [[ "$mode" != "--execute" ]]; then
  echo "Plan only. No Cloudflare state was changed."
  echo "Re-run with --execute and HQV_ROLLBACK_CONFIRM to promote this version."
  exit 0
fi

expected_confirmation="$worker_name:$version_id"
[[ "${HQV_ROLLBACK_CONFIRM:-}" == "$expected_confirmation" ]] ||
  fail "set HQV_ROLLBACK_CONFIRM exactly to $expected_confirmation"

(
  cd "$app_dir"
  wrangler rollback "$version_id" \
    --name "$worker_name" \
    --message "HQV rollback to $version_id"
)

"$repo_root/scripts/production-smoke.sh"
echo "Rollback completed and production smoke passed."
