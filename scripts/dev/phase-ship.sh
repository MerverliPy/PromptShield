#!/usr/bin/env bash
set -euo pipefail

PHASE_FILE=".opencode/plans/current-phase.md"

if [[ ! -f "$PHASE_FILE" ]]; then
  echo "Missing $PHASE_FILE"
  exit 1
fi

STATUS="$(grep -E '^Status:' "$PHASE_FILE" | head -n1 | sed 's/^Status:[[:space:]]*//')"

if [[ -z "${STATUS:-}" ]]; then
  echo "Could not read phase status from $PHASE_FILE"
  exit 1
fi

case "$STATUS" in
  COMPLETE|PASS)
    ;;
  *)
    echo "Refusing to ship: phase status is '$STATUS'"
    echo "Run /finish-phase first, or complete the phase before shipping."
    exit 1
    ;;
esac

if [[ $# -lt 1 ]]; then
  echo 'Usage: pnpm phase:ship -- "your commit message"'
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ -z "${BRANCH:-}" ]]; then
  echo "Could not determine current git branch"
  exit 1
fi

echo "Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "Nothing staged to commit."
  exit 1
fi

echo "Running changed-package verification..."
pnpm verify:changed

echo "Committing..."
git commit -m "$*"

echo "Pushing branch '$BRANCH'..."
git push origin "$BRANCH"

echo
echo "Ship complete."
