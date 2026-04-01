---
description: Execute the active implementation phase
agent: implementation
subtask: false
model: openai/gpt-5.4
---

Read:
@memory/HANDOFF.md
@docs/phases/ACTIVE.md

Implement only the active phase.

Rules:
- do not widen scope
- do not touch files outside the active phase
- run the smallest useful validation
- return blockers immediately when scope or dependencies prevent safe completion

Return:
1. changed files
2. behavior change
3. validation run
4. blocker
5. next handoff note
