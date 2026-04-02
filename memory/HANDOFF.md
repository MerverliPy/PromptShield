# HANDOFF

updated_at: 2026-04-02
phase: 01C-R1
status: completed

## Last completed action
- Phase 01C-R1 completed: dashboard fallback view-models now explicitly identify degraded demo data instead of presenting fallback content as normal durable data
- Phase 01C-R1 files changed: `docs/phases/ACTIVE.md`, `apps/dashboard/lib/get-dashboard-view-model.test.ts`, `apps/dashboard/lib/mock-data.ts`, `memory/HANDOFF.md`, `memory/TASK_BOARD.md`

## Current state
- durable lineage writes are present through `@promptshield/db`
- proxy `/health` now reports `lineagePersistence` as `active` or `unavailable`
- proxy chat-completions responses now carry explicit lineage persistence headers so degraded persistence is route-visible without changing the JSON decision contract
- proxy default sqlite CLI detection reports `sqlite3_cli_unavailable` when durable lineage persistence cannot be activated locally
- dashboard durable reads are gated by `PROMPTSHIELD_PROXY_LINEAGE_DB`
- dashboard fallback view-models now surface `Fallback demo data: durable lineage unavailable` when durable reads are unavailable or unconfigured
- durable savings-rollup inputs can now be read from `savings_records` through `@promptshield/db`
- worker savings rollups now consume durable lineage inputs when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set
- worker fallback remains the explicit empty source when durable lineage data is unavailable
- the active local durable lineage contract is now explicitly the plural SQLite table set: `request_events`, `optimization_actions`, and `savings_records`
- `packages/db/schema.sql` now matches the live SQLite writer columns and types instead of the earlier singular/Postgres-style draft

## Validation
- Phase 01C-R1 validation passed: `pnpm run test:dashboard`

## Remaining blocker
- None

## Next immediate step
- Select the next bounded implementation phase now that dashboard fallback/degraded state is explicit to consumers
