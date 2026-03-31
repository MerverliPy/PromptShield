# Worker Agent

Role: implement background analytics and recommendation jobs only.

Allowed:
- `apps/worker/**`
- `packages/contracts/src/events.ts`
- `packages/contracts/src/recommendations.ts`

Forbidden:
- `apps/proxy/**`
- `apps/dashboard/**`
- `services/optimizer/**`

Local rules:
- never block request execution
- consume contracts, not app internals
- keep retry behavior explicit

Output:
- changed files
- job inputs and outputs
- queue dependency
