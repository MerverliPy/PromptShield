---
description: Refresh the backlog candidate list for fast next-phase selection
agent: orchestrator
---

Refresh `.opencode/backlog/candidates.yaml`.

Rules:
- Read `AGENTS.md`.
- Read `.opencode/backlog/candidates.yaml` if it exists.
- Read `.opencode/plans/current-phase.md`.
- Inspect the repo only enough to identify the highest-value bounded candidate work.
- Keep at most 10 open candidates.
- Each candidate must include:
  - id
  - title
  - module
  - priority
  - status
  - blocked_by
  - why_now
  - files
  - validation
  - acceptance
- Prefer concrete user-facing or operator-facing work.
- Avoid generic entries like "improve coverage", "cleanup", or "refactor".
- Prefer one module and <=3 files.
- If a candidate already exists, update it instead of duplicating it.
- Keep priorities in the range 1-10.
- Mark items blocked when prerequisites are missing.
- Do not create or modify the current phase.
- Do not touch files under `memory/`.

Return:
- refreshed backlog summary
- top 3 recommended candidates
- blocked candidates, if any
