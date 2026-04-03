---
description: Execute the current phase through orchestrator, builder, and validator until PASS or BLOCKED
agent: orchestrator
---

Execute the current phase in `.opencode/plans/current-phase.md`.

Execution rules:
- Read `AGENTS.md`.
- Read `.opencode/plans/current-phase.md`.
- If the phase status is `DRAFT`, set it to `IN_PROGRESS` before implementation.
- Delegate implementation to `@builder`.
- Delegate validation to `@validator`.
- If validation fails, send only the smallest fix list back to `@builder`.
- Repeat until the validator returns PASS or there is a concrete blocker.
- On success, update the phase status to `COMPLETE`.
- On blocker, update the phase status to `BLOCKED` and record the blocker reason.
- Do not create or update workflow-state files outside `.opencode/plans/current-phase.md`.
- Do not widen scope beyond the active phase.

Return:
- phase summary
- changed files
- validation run
- final state
- next step
