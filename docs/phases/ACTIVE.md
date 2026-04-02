# ACTIVE PHASE

## Name
Phase 01B-R1 - Schema and runtime truth for durable lineage

## Goal
Reconcile the declared durable lineage schema with the currently active SQLite CLI runtime so the schema file, lineage writes, and dashboard reads all describe the same storage contract.

## Files in scope
- `packages/db/schema.sql`
- `packages/db/src/sql-lineage-store.ts`
- `packages/db/src/sql-dashboard-read-model.ts`

## Do not touch
- `apps/**`
- `services/**`
- `packages/policy/**`
- `docker-compose.yml`
- `memory/CURRENT_STATE.md`

## Tasks
1. Choose one truthful storage contract for the current local durable lineage path and make all scoped files match it.
2. Remove singular/plural table-name drift between the declared schema and the runtime SQL statements.
3. Keep the existing lineage write and dashboard read contracts stable unless a naming change is required to restore schema truth.
4. Preserve the current SQLite CLI path for this phase; do not widen to a new persistence integration.
5. Run the listed validation.
6. After validation passes, update `memory/HANDOFF.md` and `memory/TASK_BOARD.md` for phase closeout.

## Constraints
- do not broaden this phase to Postgres integration
- do not change environment variable names
- do not modify proxy, dashboard, worker, or optimizer code
- keep the phase bounded to `packages/db`

## Acceptance criteria
- `schema.sql` describes the same tables and columns that the active SQLite lineage writer uses
- dashboard SQL reads from the same table names used by lineage writes
- no table-name drift remains in the scoped files
- listed validation passes

## Validation
- `pnpm --filter @promptshield/db test`

## Exit condition
The declared durable lineage schema and the active SQLite runtime are truthful and aligned for local durable reads and writes.
