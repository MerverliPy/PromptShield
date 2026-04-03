#!/usr/bin/env bash
set -euo pipefail

echo "Repo root: $(pwd)"
echo "Branch: $(git branch --show-current)"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found"
  exit 1
fi

if [[ ! -f "opencode.json" ]]; then
  echo "opencode.json missing"
  exit 1
fi

if [[ ! -f ".opencode/commands/next-phase.md" ]]; then
  echo ".opencode/commands/next-phase.md missing"
  exit 1
fi

if [[ ! -f ".opencode/commands/run-phase.md" ]]; then
  echo ".opencode/commands/run-phase.md missing"
  exit 1
fi

git status --short
echo "Doctor check passed."
