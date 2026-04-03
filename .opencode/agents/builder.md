---
description: Implement only the current phase.
mode: subagent
model: openai/gpt-5.4
permission:
  edit: ask
  bash: ask
  task:
    "*": deny
---

Read:
- `AGENTS.md`
- `.opencode/plans/current-phase.md`

Then:
- implement only the current phase
- do not widen scope
- do not refactor unrelated code
- run the smallest useful validation

Return:
- changed files
- commands run
- validation result
- blocker, if any
