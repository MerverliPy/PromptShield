# PromptShield Agent Rules

## Repo boundaries
- `apps/dashboard` is UI only.
- `apps/proxy` owns ingress, request shaping, and deterministic request evaluation.
- `apps/worker` is async/background only.
- `services/optimizer` is the Python-owned optimizer HTTP boundary.
- `packages/policy` must stay pure: no network calls and no database calls.
- `packages/contracts` holds shared interfaces.
- `packages/db` owns durable lineage persistence seams.
- `packages/ui` is presentational only.

## Default execution loop
1. Refresh backlog candidates only when needed.
2. Create or update `.opencode/plans/current-phase.md`.
3. Keep exactly one active phase.
4. Keep the phase bounded:
   - prefer one module
   - prefer <=3 files
   - no opportunistic refactors
5. Implement only the current phase.
6. Run the smallest useful validation.
7. Validate the phase.
8. If validation fails, fix only the reported issues and validate again.
9. Stop only when the phase is `PASS` or `BLOCKED`.

## Backlog rules
- `.opencode/backlog/candidates.yaml` is the source of truth for next-phase selection.
- Prefer selecting from backlog over broad repo scanning.
- Broad repo discovery should happen only during backlog refresh or when backlog candidates are missing or unusable.
- Backlog items must be concrete:
  - exact module
  - exact files
  - exact validation
  - clear user-facing or operator-facing reason
- Reject generic backlog items like:
  - improve coverage
  - cleanup
  - refactor module

## Phase file contract
Every phase must contain:
- Status
- Goal
- Why this phase is next
- Backlog item
- Primary files
- Expected max files changed
- Risk
- Rollback note
- In scope
- Out of scope
- Tasks
- Validation command
- Validation
- Acceptance criteria
- Completion summary

## Non-negotiables
- Do not create extra controller/planner/review/refactor layers.
- Do not use separate handoff/task-board workflow files.
- Do not change more than one concern in a single phase.
- Do not move optimizer HTTP ownership out of Python.
- Do not put business logic into dashboard UI components.
- Do not add database or network behavior to `packages/policy`.

## Workflow state
- `.opencode/plans/current-phase.md` is the only workflow state file.
- `.opencode/backlog/candidates.yaml` is a planning input file, not a workflow state file.
- Do not create or update workflow-state files outside `.opencode/plans/current-phase.md`.
- Do not create archive, handoff, task-board, or next-steps workflow files.
- Use Git history for prior phase history.
