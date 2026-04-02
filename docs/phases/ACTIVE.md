# ACTIVE PHASE

## Name
Phase 01C-R1 - Dashboard durable-data fallback is explicit

## Goal
Make dashboard fallback behavior visibly degraded when durable lineage data is unavailable, instead of presenting fallback content as normal durable data.

## Files in scope
- `apps/dashboard/lib/get-dashboard-view-model.ts`
- `apps/dashboard/lib/get-dashboard-view-model.test.ts`
- `apps/dashboard/lib/mock-data.ts`

## Do not touch
- `packages/db/**`
- `apps/proxy/**`
- `apps/worker/**`
- `services/**`
- `memory/CURRENT_STATE.md`

## Tasks
1. Make the dashboard view-model explicitly indicate when it is using fallback data rather than durable lineage data.
2. Preserve the existing durable-summary path when the database is available.
3. Update scoped tests so missing env or read failures assert an explicit fallback/degraded indicator.
4. Keep the phase bounded to dashboard view-model behavior only.
5. Run the listed validation.
6. After validation passes, update `memory/HANDOFF.md` and `memory/TASK_BOARD.md` for phase closeout.

## Constraints
- do not change dashboard page composition outside what the view-model contract requires
- do not modify proxy or db code in this phase
- do not invent new backend behavior
- keep the phase bounded to `apps/dashboard/lib`

## Acceptance criteria
- dashboard fallback state is explicit in the view model
- durable-data state remains explicit and unchanged when the database is available
- scoped tests cover both durable and fallback paths
- listed validation passes

## Validation
- `pnpm run test:dashboard`

## Exit condition
Dashboard consumers can distinguish durable lineage data from fallback/mock data without guessing from context.
