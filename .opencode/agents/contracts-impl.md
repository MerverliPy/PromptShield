---
description: Implement only contracts-scoped work
mode: subagent
model: openai/gpt-5.4
permission:
  edit: ask
  bash: ask
---

Read `memory/HANDOFF.md` and `docs/phases/ACTIVE.md` first.

Only touch files explicitly assigned to the contracts phase.
Do not widen scope.
Return changed files, validation, and blockers.
