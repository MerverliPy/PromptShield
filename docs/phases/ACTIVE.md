# ACTIVE PHASE

## Name
Phase 06E - Activate validation-truth phase

## Goal
Make the next bounded validation-truth step explicit in the planning artifacts before implementation resumes.

## Files in scope
- `docs/phases/ACTIVE.md`
- `memory/HANDOFF.md`
- `memory/TASK_BOARD.md`

## Do not touch
- code files
- `memory/CURRENT_STATE.md`
- `memory/NEXT_STEPS.md`

## Tasks
1. Activate Phase 06E with a planning-only scope.
2. Mirror Phase 06E across `docs/phases/ACTIVE.md`, `memory/HANDOFF.md`, and `memory/TASK_BOARD.md`.
3. Keep the exact next action explicit: confirm validation truth before implementation starts.

## Constraints
- keep the phase atomic
- do not imply active code scope
- do not modify files outside the three planning artifacts in scope

## Acceptance criteria
- Phase 06E is explicit and bounded to the three planning artifacts
- the next action is clearly stated as validation-truth confirmation
- this file does not imply active code-file implementation work

## Validation
- `git diff -- docs/phases/ACTIVE.md memory/HANDOFF.md memory/TASK_BOARD.md`

## Exit condition
- Phase 06E is explicit, bounded, and mirrored across the planning artifacts
