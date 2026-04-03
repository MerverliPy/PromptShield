---
description: Choose the next bounded implementation phase from the backlog first
agent: orchestrator
---

Create the next bounded implementation phase in `.opencode/plans/current-phase.md`.

Input handling:
- If the user includes text after `/next-phase`, treat it as a filter for candidate id, title, or module.

State rules:
- `.opencode/plans/current-phase.md` is the only workflow state file.
- `.opencode/backlog/candidates.yaml` is a planning input, not a workflow state file.
- Do not create archive or history files for prior phases.
- Do not modify files under `memory/`.
- If `.opencode/plans/current-phase.md` exists with Status `DRAFT` or `IN_PROGRESS`, do not overwrite it unless the user explicitly asked to replace or replan the active phase.
- If `.opencode/plans/current-phase.md` exists with Status `COMPLETE`, `PASS`, or `BLOCKED`, replace it in place with the new phase.

Selection source order:
1. Read `.opencode/backlog/candidates.yaml`.
2. Choose only from candidates with:
   - `status: open`
   - no blockers in `blocked_by`
   - concrete files
   - concrete validation
3. If no usable candidate exists, refresh the backlog first, then select.
4. If no safe candidate exists after refresh, mark the phase `BLOCKED` and explain why.

Selection ranking:
1. explicit user scope/filter
2. highest priority
3. same-module follow-up from the last completed or active phase
4. smallest safe scope
5. clearest validation path

Reject:
- generic items without exact files
- generic items without exact validation
- broad refactors
- multi-module work unless unavoidable

Write `.opencode/plans/current-phase.md` with exactly these sections:

# Current Phase

Status: DRAFT

## Goal

## Why this phase is next

## Backlog item

## Primary files
- ...

## Expected max files changed

## Risk

## Rollback note

## In scope

## Out of scope

## Tasks
- ...

## Validation command

## Validation
- ...

## Acceptance criteria
- ...

## Completion summary

Constraints:
- Do not implement anything yet.
- Do not create extra workflow files.
- Do not widen scope.
