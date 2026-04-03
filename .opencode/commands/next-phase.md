---
description: Create the next bounded implementation phase
agent: orchestrator
---

Create the next bounded implementation phase in `.opencode/plans/current-phase.md`.

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

## In scope

## Out of scope

## Tasks
- ...

## Validation
- ...

## Acceptance criteria
- ...

Constraints:
- Do not implement anything yet.
- Do not create extra workflow files.
- Do not widen scope.
- If no safe bounded phase exists, mark Status as BLOCKED and explain why.
