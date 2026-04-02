# ACTIVE PHASE

## Name
No active implementation phase

## Goal
Keep the active-phase instructions truthful while the next atomic implementation phase is being planned.

## Files in scope
- `docs/phases/ACTIVE.md`
- `memory/HANDOFF.md`
- `memory/TASK_BOARD.md`

## Do not touch
- `memory/CURRENT_STATE.md`
- code files

## Tasks
1. Define the next atomic implementation phase.
2. Update this file only when that next bounded phase is ready to execute.

## Constraints
- do not leave stale implementation instructions here
- do not imply an active code scope when none is defined
- keep the next phase atomic and bounded before implementation resumes

## Acceptance criteria
- this file does not point at stale Phase 04B, 04C, or 05C instructions
- it is clear that no implementation phase is currently active
- the next implementation step is to plan the next atomic phase

## Validation
- `git diff -- memory/HANDOFF.md memory/TASK_BOARD.md docs/phases/ACTIVE.md`

## Exit condition
- a new active implementation phase is explicitly defined here
