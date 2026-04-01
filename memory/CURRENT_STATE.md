# CURRENT_STATE

updated_at: 2026-04-01
phase: Phase 01F
status: active

## Architecture
- monorepo with dashboard, proxy, worker, optimizer, and shared packages
- deterministic budget and routing logic isolated in `packages/policy`
- shared TypeScript contracts isolated in `packages/contracts`
- database lineage centered on request, optimization action, and savings records

## What exists
- runnable structural baseline across proxy, dashboard, worker, and optimizer surfaces
- durable lineage schema and aligned contracts exist
- proxy request normalization generates deterministic lineage metadata
- proxy route builds a typed lineage event payload shell
- dashboard exists as a shell backed by demo data
- worker exists as a placeholder surface

## Known risks
- runtime write and read paths are not yet wired end to end
- proxy lineage payload shell is not yet emitted through a dedicated seam
- dashboard is not yet backed by durable lineage records
- worker jobs are not yet implemented beyond placeholder status
- optimizer ownership is split across Python and TypeScript surfaces
