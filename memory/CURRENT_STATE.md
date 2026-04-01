# CURRENT_STATE

## Architecture
- monorepo with dashboard, proxy, worker, optimizer, and shared packages
- deterministic budget and routing logic isolated in `packages/policy`
- shared TypeScript contracts isolated in `packages/contracts`
- database lineage centered on request, optimization action, and savings records

## What exists
- runnable baseline across proxy, dashboard, worker, and optimizer surfaces
- workspace wiring is stable for apps, packages, and services with root-level optimizer workflows
- durable lineage foundation is in place across request/action/savings schema and aligned contracts
- tracked `.env.example` and artifact-ignore hygiene are in place for clean local setup

## Known risks
- runtime write/read paths are not yet fully wired to lineage records across proxy/worker/dashboard
- contract and schema evolution still needs disciplined versioning to prevent cross-service drift
