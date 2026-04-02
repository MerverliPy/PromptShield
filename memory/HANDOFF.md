# HANDOFF

updated_at: 2026-04-02
phase: 00T-R1
status: completed

## Last completed action
- Phase 00T-R1 completed: top-level documentation now describes the current proxy, dashboard, worker, and optimizer runtime truth without overstating provider dispatch or broader durable behavior
- Phase 00T-R1 files changed: `docs/phases/ACTIVE.md`, `README.md`, `docs/architecture.md`, `memory/CURRENT_STATE.md`, `memory/HANDOFF.md`, `memory/TASK_BOARD.md`

## Current state
- durable lineage writes are present through `@promptshield/db`
- proxy `/health` now reports `lineagePersistence` as `active` or `unavailable`
- proxy chat-completions responses now carry explicit lineage persistence headers so degraded persistence is route-visible without changing the JSON decision contract
- proxy default sqlite CLI detection reports `sqlite3_cli_unavailable` when durable lineage persistence cannot be activated locally
- dashboard durable reads are gated by `PROMPTSHIELD_PROXY_LINEAGE_DB`
- dashboard fallback view-models now surface `Fallback demo data: durable lineage unavailable` when durable reads are unavailable or unconfigured
- `@promptshield/policy` can now validate `evaluateRequest` directly through a package-level test script
- durable savings-rollup inputs can now be read from `savings_records` through `@promptshield/db`
- worker savings rollups now consume durable lineage inputs when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set
- worker fallback remains the explicit empty source when durable lineage data is unavailable
- the active local durable lineage contract is now explicitly the plural SQLite table set: `request_events`, `optimization_actions`, and `savings_records`
- `packages/db/schema.sql` now matches the live SQLite writer columns and types instead of the earlier singular/Postgres-style draft
- `README.md` and `docs/architecture.md` now describe the current local SQLite-backed runtime and explicit degraded paths instead of a broader future-state architecture

## Validation
- Phase 00T-R1 validation passed: `git diff -- README.md docs/architecture.md memory/CURRENT_STATE.md`

## Remaining blocker
- None

## Next immediate step
- Select the next bounded implementation phase now that top-level documentation matches the current runtime truth
