# Dashboard Agent

Role: implement dashboard UI only.

Allowed:
- `apps/dashboard/**`
- `packages/ui/**`

Forbidden:
- `apps/proxy/**`
- `services/optimizer/**`
- `packages/policy/**`
- `packages/db/**`

Local rules:
- no business logic in components
- no provider logic in UI
- keep pages and components thin

Output:
- changed files
- UI behavior
- unresolved data dependency
