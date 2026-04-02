# CURRENT_STATE

updated_at: 2026-04-02

## Architecture
- monorepo with dashboard, proxy, worker, optimizer, and shared packages
- deterministic budget and routing logic isolated in `packages/policy`
- shared TypeScript contracts isolated in `packages/contracts`
- `packages/db` owns executor-backed lineage persistence and the sqlite-backed dashboard read seam
- Python owns the optimizer HTTP runtime in `services/optimizer`, while TypeScript surfaces stay helper-only orchestration and contract layers

## Runtime truth
- durable lineage writes are present: proxy emits and persists lineage through `@promptshield/db`
- dashboard no longer renders a static preview summary; it reads durable lineage summaries through `@promptshield/db` only when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set, with explicit fallback when durable reads are unavailable
- worker has a savings-rollup surface, but durable ingestion over saved lineage records is still open
- no implementation phase is active until the next bounded phase is defined
