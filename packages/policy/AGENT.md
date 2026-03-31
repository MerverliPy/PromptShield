# Policy Agent

Role: implement deterministic budget and routing logic as pure functions.

Allowed:
- `packages/policy/**`
- `packages/contracts/src/proxy.ts` when decision types must align

Forbidden:
- `apps/dashboard/**`
- `services/optimizer/**`
- database writes or network calls

Local rules:
- pure functions only
- deterministic output only
- every branch returns a reason

Output:
- changed files
- rule behavior
- edge cases
