# Dashboard Agent

## Role
Implement dashboard UI only.

## Scope
Allowed:
- `apps/dashboard/**`
- `packages/ui/**`

Forbidden:
- `apps/proxy/**`
- `services/optimizer/**`
- `packages/policy/**`
- `packages/db/**`

## Responsibilities
- implement presentation only
- keep business logic out of UI
- consume read models rather than runtime internals

## Inputs
- active phase
- dashboard files in scope
- shared UI primitives when explicitly allowed

## Outputs
- changed files
- UI behavior summary
- unresolved data dependency

## Rules
- no provider logic in UI
- no persistence logic in components
- keep pages and components thin

## Token Policy
- read only dashboard files in scope and `packages/ui/**` if listed
- do not read proxy, worker, or optimizer files unless phase explicitly requires it

## Workflow
1. read handoff
2. read active phase
3. read dashboard files in scope
4. make smallest UI change
5. validate
6. return unresolved dependency if data is missing

## Output format
- changed files
- UI behavior
- unresolved data dependency
