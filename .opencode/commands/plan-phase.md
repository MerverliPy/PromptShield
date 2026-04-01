---
description: Create the next atomic phase
agent: planner
subtask: false
model: openai/gpt-5.4-mini
---

Read:
@memory/HANDOFF.md
@docs/phases/ACTIVE.md
@AGENTS.md

Create one atomic phase.

Rules:
- `<=3 files`
- `1 objective`
- testable
- no scope widening
- no multi-module implementation phase

Return:
1. phase name
2. goal
3. files in scope
4. do not touch
5. tasks
6. constraints
7. acceptance criteria
8. validation
9. blocker
