---
description: Create the next bounded implementation phase
agent: orchestrator
---

Create the next bounded implementation phase in `.opencode/plans/current-phase.md`.

State rules:
- `.opencode/plans/current-phase.md` is the only workflow state file.
- Do not create archive or history files for prior phases.
- Do not create or update workflow-state files outside `.opencode/plans/current-phase.md`.
- If `.opencode/plans/current-phase.md` exists with Status `DRAFT` or `IN_PROGRESS`, do not overwrite it unless the user explicitly asked to replace or replan the active phase.
- If `.opencode/plans/current-phase.md` exists with Status `COMPLETE`, `PASS`, or `BLOCKED`, replace it in place with the new phase.

Selection rubric:
1. Read `AGENTS.md`.
2. Inspect the current repo state.
3. Identify candidate tasks from:
   - failing tests
   - missing tests around active code paths
   - TODO/FIXME notes in active code
   - unfinished seams or obvious implementation gaps
   - current app surfaces that are incomplete or misleading
4. Exclude blocked work.
5. Exclude broad refactors or multi-module work unless unavoidable.
6. Rank the remaining candidates by:
   - highest project value
   - smallest safe scope
   - clearest validation path
   - strongest dependency-unlocking effect
7. Choose exactly one bounded phase, preferably in one module and <=3 files.

Write `.opencode/plans/current-phase.md` with exactly these sections:

# Current Phase

Status: DRAFT

## Goal

## Why this phase is next

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
- If no safe bounded phase exists, mark Status as BLOCKED and explain why.
