---
description: Summarize the completed phase, validation, and commit-ready outcome
agent: orchestrator
---

Finish the active phase in `.opencode/plans/current-phase.md`.

Rules:
- Read `AGENTS.md`.
- Read `.opencode/plans/current-phase.md`.
- Read the changed files and validation results needed to summarize the completed work.
- Do not create a new phase.
- Do not implement new code.
- If the phase status is `IN_PROGRESS` and the validator already passed, update it to `COMPLETE`.
- If the phase is not complete, report that it is not ready to finish.

Return:
- phase status
- goal
- primary files changed
- validation run
- acceptance criteria status
- residual risk
- rollback note
- suggested commit message
- concise completion summary

If the phase is not complete, say so clearly and do not mark it complete.
