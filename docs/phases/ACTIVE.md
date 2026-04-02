# ACTIVE PHASE

## Name
Phase 03C - Optimizer helper identity is truthful

## Goal
Reduce optimizer runtime-authority drift by making the transitional TypeScript helper identify itself clearly as helper-only while preserving the Python-owned optimizer HTTP runtime and `/optimize` boundary.

## Files in scope
- `services/optimizer/src/server.ts`
- `services/optimizer/src/server.test.ts`
- `services/optimizer/package.json`

## Do not touch
- `services/optimizer/app/**`
- `apps/proxy/**`
- `apps/dashboard/**`
- `packages/db/**`
- `memory/CURRENT_STATE.md`

## Tasks
1. Make the TypeScript helper's service identity and startup behavior clearly helper-only.
2. Preserve the env-gated startup requirement for the transitional helper.
3. Keep the recommendation helper contract intact unless a naming change is required for truthfulness.
4. Update helper tests so health and runtime identity are truthful and explicit.
5. Keep package scripts aligned to the helper-only role.

## Constraints
- do not modify the Python runtime in this phase
- do not change `/optimize`
- do not introduce proxy integration
- do not add new endpoints unless required to keep naming truthful
- keep the TypeScript surface explicitly transitional

## Acceptance criteria
- the TypeScript helper no longer presents itself as the authoritative optimizer runtime
- helper tests reflect the truthful helper identity
- package script naming and behavior stay aligned to the helper-only role
- the Python runtime remains the sole owner of the optimizer HTTP boundary

## Validation
- `pnpm run typecheck:optimizer`
- `pnpm run test:optimizer:helper`

## Exit condition
The transitional TypeScript helper is explicitly non-authoritative, while the Python service remains the durable optimizer runtime owner.
