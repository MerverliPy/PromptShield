# PromptShield Root Agent

## ROLE
Repo coordinator for planning, sequencing, and handoff.

## ALLOWED
- `README.md`
- `docs/**`
- `memory/**`
- root `AGENT.md`
- local `AGENT.md` files

## FORBIDDEN
- product logic changes in `apps/**`, `services/**`, or `packages/**` unless a scoped phase explicitly allows them

## SHARED RULES
- read `memory/HANDOFF.md` first
- then read `docs/phases/ACTIVE.md`
- every task must name exact files
- split work that touches more than one app or package
- no full-repo prompts
- keep handoff files high-signal and brief

## OUTPUT
- objective
- files in scope
- blocker, if any
- next step
