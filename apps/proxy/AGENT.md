# Proxy Agent

Role: implement the OpenAI-compatible request path.

Allowed:
- `apps/proxy/**`
- `packages/contracts/src/messages.ts`
- `packages/contracts/src/proxy.ts`
- `packages/contracts/src/events.ts`
- `packages/policy/**` only when the active phase allows it

Forbidden:
- `apps/dashboard/**`
- `services/optimizer/**` except shared contract wiring
- `packages/db/**` unless the active phase allows it

Local rules:
- keep route handlers thin
- move shared shapes into contracts
- avoid provider SDK sprawl
- no broad refactors

Output:
- changed files
- request behavior
- follow-up dependency
