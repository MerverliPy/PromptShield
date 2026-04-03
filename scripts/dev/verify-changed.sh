#!/usr/bin/env bash
set -euo pipefail

if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  BASE="$(git merge-base HEAD @{u})"
  RANGE="$BASE...HEAD"
elif git rev-parse --verify origin/main >/dev/null 2>&1; then
  BASE="$(git merge-base HEAD origin/main)"
  RANGE="$BASE...HEAD"
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
run_all_on_root_config=0

echo "Changed files detected in range: $RANGE"
echo "$CHANGED"
echo

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  case "$file" in
    .opencode/*|.githooks/*|docs/*|README.md|LICENSE|*.md)
      ;;

    apps/dashboard/lib/*|apps/dashboard/components/*|apps/dashboard/app/*|apps/dashboard/test/*|apps/dashboard/*.json|apps/dashboard/*.ts|apps/dashboard/*.tsx)
      run_dashboard=1
      ;;

    apps/proxy/src/*|apps/proxy/test/*|apps/proxy/*.json|apps/proxy/*.ts)
      run_proxy=1
      ;;

    apps/worker/src/*|apps/worker/test/*|apps/worker/*.json|apps/worker/*.ts)
      run_worker=1
      ;;

    packages/contracts/*|packages/policy/*)
      run_proxy=1
      run_worker=1
      ;;

    packages/db/*)
      run_dashboard=1
      run_proxy=1
      run_worker=1
      ;;

    packages/ui/*)
      run_dashboard=1
      ;;

    services/optimizer/*)
      ;;

    package.json|pnpm-lock.yaml|pnpm-workspace.yaml|tsconfig.json|tsconfig.*.json|turbo.json|vitest.config.*|eslint.config.*|.eslintrc*|.prettierrc*|.npmrc)
      run_all_on_root_config=1
      ;;

    *)
      run_dashboard=1
      run_proxy=1
      run_worker=1
      ;;
  esac
done <<< "$CHANGED"

if [[ "$run_all_on_root_config" -eq 1 ]]; then
  run_dashboard=1
  run_proxy=1
  run_worker=1
fi

if [[ "$run_dashboard" -eq 0 && "$run_proxy" -eq 0 && "$run_worker" -eq 0 ]]; then
  echo "No mapped package checks required."
  exit 0
fi

if [[ "$run_dashboard" -eq 1 ]]; then
  echo "Running dashboard verification..."
  pnpm verify:dashboard
  echo
fi

if [[ "$run_proxy" -eq 1 ]]; then
  echo "Running proxy verification..."
  pnpm verify:proxy
  echo
fi

if [[ "$run_worker" -eq 1 ]]; then
  echo "Running worker verification..."
  pnpm verify:worker
  echo
fi

echo "Changed-package verification passed."
