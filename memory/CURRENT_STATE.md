# CURRENT_STATE

updated_at: 2026-04-01
phase: durable
status: active

## Architecture
- monorepo with dashboard, proxy, worker, optimizer, and shared packages
- deterministic budget and routing logic isolated in `packages/policy`
- shared TypeScript contracts isolated in `packages/contracts`
- `packages/db` is the bounded persistence surface for lineage storage and later durable read models
- Python owns the optimizer HTTP runtime in `services/optimizer`, while TypeScript surfaces stay helper-only orchestration and contract layers
- database lineage centered on request, optimization action, and savings records

## What exists
- runnable structural baseline across proxy, dashboard, worker, optimizer, and shared persistence surfaces
- durable lineage schema and aligned contracts exist
- proxy request normalization generates deterministic lineage metadata
- proxy route builds and emits a typed lineage event payload through an explicit seam
- dashboard has a contracts/read-model seam, but the app still renders a static preview summary
- worker has a savings-rollup surface, but durable ingestion jobs are not implemented yet

## Known risks
- runtime write and read paths are not yet wired end to end
- db durable write and read paths are not yet wired through the full lineage flow
- dashboard is not yet backed by durable lineage records
- worker ingestion over saved lineage records is not implemented yet
- optimizer integrations still need full alignment to the Python-owned `/optimize` boundary
