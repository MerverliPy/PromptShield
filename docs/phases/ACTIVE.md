# ACTIVE PHASE

## Name
Phase 02-R1 - Policy package has direct deterministic validation

## Goal
Add direct package-level validation for the deterministic policy core so routing and budget behavior can be verified without depending on proxy integration tests alone.

## Files in scope
- `packages/policy/package.json`
- `packages/policy/src/evaluate-request.ts`
- `packages/policy/src/evaluate-request.test.ts`

## Do not touch
- `apps/**`
- `packages/db/**`
- `services/**`
- `packages/policy/src/evaluate-budget.ts`
- `packages/policy/src/evaluate-routing.ts`
- `memory/CURRENT_STATE.md`

## Tasks
1. Add a direct policy-package test script in `packages/policy/package.json`.
2. Add a narrow deterministic test file for `evaluate-request.ts`.
3. Cover the highest-value request evaluation cases already implied by the current request contract and deterministic routing/budget behavior.
4. Keep the implementation bounded to direct request evaluation; do not broaden to the other policy modules in this phase.
5. Run the listed validation.
6. After validation passes, update `memory/HANDOFF.md` and `memory/TASK_BOARD.md` for phase closeout.

## Constraints
- do not modify proxy tests in this phase
- do not introduce network or database behavior into `packages/policy`
- keep the phase limited to one policy entry and one direct test file
- do not refactor unrelated policy modules

## Acceptance criteria
- `packages/policy` has a direct test command
- request evaluation behavior is covered by direct deterministic tests
- no proxy integration is required to validate the scoped policy behavior
- listed validation passes

## Validation
- `pnpm --filter @promptshield/policy test`

## Exit condition
The policy package can validate its scoped deterministic request behavior directly and independently.
