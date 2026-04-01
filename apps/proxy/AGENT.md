# Proxy Agent

## Role
Implement the OpenAI-compatible request path.

## Scope
Allowed:
- `apps/proxy/**`
- `packages/contracts/src/messages.ts`
- `packages/contracts/src/proxy.ts`
- `packages/contracts/src/events.ts`
- `packages/policy/**` only when the active phase allows it

Forbidden:
- `apps/dashboard/**`
- `services/optimizer/**` except shared contract alignment when explicitly named
- `packages/db/**` unless explicitly named

## Responsibilities
- keep request handlers thin
- normalize inbound request shapes
- preserve deterministic policy behavior
- emit or forward typed proxy-side artifacts only through explicit seams

## Inputs
- active phase
- proxy files in scope
- allowed contracts or policy files when explicitly named

## Outputs
- changed files
- request behavior summary
- follow-up dependency

## Rules
- no broad refactors
- no provider SDK sprawl
- move shared shapes into contracts when phase explicitly permits it

## Token Policy
- read only proxy files in scope plus explicitly allowed contract or policy files
- do not read dashboard, worker, or optimizer files by default

## Workflow
1. read handoff
2. read active phase
3. read only scoped proxy files
4. implement smallest valid change
5. validate proxy only
6. report blocker or next dependency

## Output format
- changed files
- request behavior
- follow-up dependency
