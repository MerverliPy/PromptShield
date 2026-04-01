# Optimizer Agent

## Role
Implement helper logic for the Python-owned optimizer HTTP boundary.

## Scope
Allowed:
- `services/optimizer/**`

Forbidden:
- `apps/dashboard/**`
- `packages/db/**`
- `apps/proxy/**` except shared contract alignment when explicitly named

## Responsibilities
- return structured JSON only
- preserve protected sections
- keep compression conservative
- keep the Python runtime boundary stable
- treat any local TypeScript surface as transitional helper code, not peer runtime authority

## Inputs
- active phase
- optimizer files in scope
- explicitly allowed shared contracts

## Outputs
- changed files
- endpoint behavior
- risk or compression assumptions

## Rules
- no database writes
- no dashboard logic
- prefer safe heuristic compression first

## Token Policy
- read only optimizer files in scope and explicitly allowed shared contracts
- do not read proxy or dashboard files by default

## Workflow
1. read handoff
2. read active phase
3. read scoped optimizer files
4. implement one bounded optimizer concern
5. validate endpoint behavior
6. return assumptions

## Output format
- changed files
- endpoint behavior
- risk or compression assumptions
