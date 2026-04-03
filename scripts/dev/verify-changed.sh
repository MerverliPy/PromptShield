#!/usr/bin/env bash
set -euo pipefail

if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  RANGE="$(git merge-base HEAD @{u})...HEAD"
elif git rev-parse --verify origin/main >/dev/null 2>&1; then
  RANGE="$(git merge-base HEAD origin/main)...HEAD"
else
  RANGE="HEAD~1..HEAD"
fi

CHANGED="$(git diff --name-only "$RANGE" || true)"

if [[ -z "${CHANGED}" ]]; then
  echo "No changed files detected in push range."
  exit 0
fi

run_dashboard=0
run_proxy=0
run_worker=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  case "$file" in
    apps/dashboard/*)
      run_dashboard=1
      ;;
    apps/proxy/*|packages/contracts/*|packages/policy/*|packages/db/*)
      run_proxy=1
      ;;
    apps/worker/*|packages/contracts/*|packages/policy/*|packages/db/*)
      run_worker=1
      ;;
  esac
done <<< "$CHANGED"

echo "Changed files detected in range: $RANGE"
echo "$CHANGED"

if [[ "$run_dashboard" -eq 0 && "$run_proxy" -eq 0 && "$run_worker" -eq 0 ]]; then
  echo "No mapped package checks required."
  exit 0
fi

if [[ "$run_dashboard" -eq 1 ]]; then
  echo
  echo "Running dashboard verification..."
  pnpm verify:dashboard
fi

if [[ "$run_proxy" -eq 1 ]]; then
  echo
  echo "Running proxy verification..."
  pnpm verify:proxy
fi

if [[ "$run_worker" -eq 1 ]]; then
  echo
  echo "Running worker verification..."
  pnpm verify:worker
fi

echo
echo "Changed-package verification passed."
