# CURRENT_STATE

## Architecture
- monorepo with dashboard, proxy, worker, optimizer, and shared packages
- deterministic budget and routing logic isolated in `packages/policy`
- shared TypeScript contracts isolated in `packages/contracts`
- database lineage centered on request, optimization action, and savings records

## What exists
- repo scaffold
- bounded architecture doc
- scoped agent system
- active phase prompt
- minimal runtime stubs for proxy, dashboard, worker, and optimizer

## Known risks
- TS and Python contracts can drift until schema generation is added
- proxy/optimizer coupling should stay behind explicit contracts
- analytics scope can outgrow core savings proof
