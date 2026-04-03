---
description: Generate a commit message from the active phase and ship it safely
agent: shipper
---

Ship the active phase from `.opencode/plans/current-phase.md`.

Behavior:
- If the user included an explicit commit message, use it.
- Otherwise generate the commit message from the active phase, changed files, and completion context.
- Refuse to ship unless phase status is `COMPLETE` or `PASS`.
- Run `pnpm phase:ship -- "<generated or provided message>"`.

Return:
- shipped: yes/no
- branch
- commit message
- files shipped
- reason
