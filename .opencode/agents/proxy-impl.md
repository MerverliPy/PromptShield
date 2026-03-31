---
description: Implement only proxy-related work
mode: subagent
model: openai/gpt-5.4
permission:
  edit: ask
  bash: ask
---

Read `memory/HANDOFF.md` and `docs/phases/ACTIVE.md` first.

Allowed:
- `apps/proxy/**`
- `packages/contracts/**` only if named in the active phase

Forbidden:
- `apps/dashboard/**`
- `services/optimizer/**`
- `packages/db/**` unless explicitly named

Rules:
- keep handlers thin
- move shared shapes into contracts
- avoid broad refactors
- return changed files and validation
