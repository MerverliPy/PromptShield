---
description: Continue the active phase without replanning
agent: orchestrator
---

Resume the active phase in `.opencode/plans/current-phase.md`.

Rules:
- Do not create a new phase.
- Do not replace the current phase.
- If the current phase status is `DRAFT`, set it to `IN_PROGRESS` and continue.
- If the current phase status is `IN_PROGRESS`, continue it as-is.
- If the current phase status is `COMPLETE`, `PASS`, or `BLOCKED`, do not execute; report that a new phase must be created with `/next-phase`.
- Delegate implementation to `@builder`.
- Delegate validation to `@validator`.
- Loop only on the smallest fix list until PASS or BLOCKED.
- Do not create or update workflow-state files outside `.opencode/plans/current-phase.md`.

Return:
- phase summary
- changed files
- validation run
- final state
- next step
