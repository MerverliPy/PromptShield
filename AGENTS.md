# PromptShield OpenCode Rules

## Execution Order
1. Read `memory/HANDOFF.md`
2. Read `docs/phases/ACTIVE.md`
3. Read only the local `AGENT.md` for the active area
4. Read only files in current scope
5. Execute the smallest useful step
6. Validate
7. Update handoff and task board

## Scope Rules
- no full repo scans unless the task explicitly requires one
- no multi-module implementation phases
- split if `>3 files`
- split if `>1 module`
- do not load unrelated local `AGENT.md` files
- do not modify files outside active scope

## Workflow Roles
- Controller: classify and route
- Planner: define one atomic phase
- Implementation: execute scoped phase
- Review: validate scoped phase
- Refactor: reduce token waste without changing behavior

## Memory Rules
- update `memory/HANDOFF.md` after each completed phase
- update `memory/TASK_BOARD.md` on each phase start and finish
- keep `memory/CURRENT_STATE.md` architectural only
- keep `memory/HANDOFF.md` and `memory/TASK_BOARD.md` for operational progress tracking
- keep `memory/NEXT_STEPS.md` sequenced only
- keep `memory/DECISIONS.md` for durable decisions only

## Phase Rules
Every active phase must include:
- Goal
- Files in scope
- Do not touch
- Tasks
- Constraints
- Acceptance criteria
- Validation
- Exit condition

## Completion Rules
A phase is complete only when:
- acceptance criteria pass
- listed validation has been run
- handoff is updated
- task board is updated
- next steps are still correct
