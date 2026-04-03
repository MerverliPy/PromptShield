#!/usr/bin/env bash
set -euo pipefail

echo "Repo root: $(pwd)"
echo "Branch: $(git branch --show-current)"
echo

command -v git >/dev/null 2>&1 || { echo "git not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm not found"; exit 1; }

[[ -f "opencode.json" ]] || { echo "opencode.json missing"; exit 1; }
[[ -f "AGENTS.md" ]] || { echo "AGENTS.md missing"; exit 1; }
[[ -f ".opencode/commands/next-phase.md" ]] || { echo ".opencode/commands/next-phase.md missing"; exit 1; }
[[ -f ".opencode/commands/run-phase.md" ]] || { echo ".opencode/commands/run-phase.md missing"; exit 1; }
[[ -f ".opencode/commands/resume-phase.md" ]] || { echo ".opencode/commands/resume-phase.md missing"; exit 1; }
[[ -f ".opencode/plans/current-phase.md" ]] || { echo ".opencode/plans/current-phase.md missing"; exit 1; }

echo "Git status:"
git status --short
echo
echo "Doctor check passed."
