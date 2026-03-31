# PromptShield OpenCode Rules

## Scope
- Work only inside this repository.
- Start with `memory/HANDOFF.md` and `docs/phases/ACTIVE.md`.
- Do not scan the entire repo unless the task explicitly requires it.
- Prefer narrow file reads and bounded edits.
- Keep changes scoped to one app or one package at a time.
- Do not modify real `.env` files.
- Do not widen scope without stating why.

## Repo shape
- `apps/` contains deployable apps
- `packages/` contains shared TypeScript packages
- `services/` contains sidecar services
- `memory/` contains handoff/state files
- `docs/phases/` contains bounded implementation phases
- `packages/*/AGENT.md`, `apps/*/AGENT.md`, and `services/*/AGENT.md` should be treated as local sub-area instructions when you work in those folders

## Execution order
1. Read `memory/HANDOFF.md`
2. Read `docs/phases/ACTIVE.md`
3. Read only files named by the current phase
4. Implement the smallest useful change
5. Validate only what changed
