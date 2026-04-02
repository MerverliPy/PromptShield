# ACTIVE PHASE

## Name
No active phase

## Goal
Park planning state until the next bounded phase is defined.

## Files in scope
- None

## Do not touch
- code files
- `memory/CURRENT_STATE.md`
- `memory/NEXT_STEPS.md`

## Tasks
1. Define Phase `NEXT`.
2. Mirror Phase `NEXT` across `docs/phases/ACTIVE.md`, `memory/HANDOFF.md`, and `memory/TASK_BOARD.md`.

## Constraints
- do not imply any active implementation scope
- keep the repo parked until Phase `NEXT` is explicit

## Acceptance criteria
- this file truthfully states that no phase is active
- the next phase id is explicitly reserved as `NEXT`

## Validation
- `git diff -- docs/phases/ACTIVE.md memory/HANDOFF.md memory/TASK_BOARD.md`

## Exit condition
- Phase `NEXT` is defined and mirrored across the planning artifacts
