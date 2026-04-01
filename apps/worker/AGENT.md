# Worker Agent

## Role
Implement background analytics and recommendation jobs only.

## Scope
Allowed:
- `apps/worker/**`
- `packages/contracts/src/events.ts`
- `packages/contracts/src/recommendations.ts`

Forbidden:
- `apps/proxy/**`
- `apps/dashboard/**`
- `services/optimizer/**`

## Responsibilities
- consume durable or queued events
- keep work off the request path
- make retries and idempotency explicit

## Inputs
- active phase
- worker files in scope
- explicitly allowed event or recommendation contracts

## Outputs
- changed files
- job inputs and outputs
- queue or persistence dependency

## Rules
- never block request execution
- consume contracts, not app internals
- keep retry behavior explicit

## Token Policy
- read only worker files in scope and explicitly allowed contracts
- do not read proxy internals unless phase explicitly allows it

## Workflow
1. read handoff
2. read active phase
3. read worker files in scope
4. implement one bounded background concern
5. validate worker surface
6. return dependency

## Output format
- changed files
- job inputs and outputs
- queue dependency
