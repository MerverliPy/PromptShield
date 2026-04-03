# PromptShield Workflow Cheat Sheet

## Core OpenCode commands

### Create the next bounded phase
`/next-phase`

What it does:
- asks the orchestrator to inspect the repo
- chooses the highest-value bounded next task
- writes `.opencode/plans/current-phase.md`
- does not implement yet

### Execute the current phase
`/run-phase`

What it does:
- reads `.opencode/plans/current-phase.md`
- orchestrator delegates to `builder`
- validator checks the result
- loops until `PASS` or `BLOCKED`
- updates phase status

### Continue the active phase without replanning
`/resume-phase`

What it does:
- resumes only the current active phase
- does not generate a new phase
- refuses to run if the active phase is already complete or blocked

### Show current phase without changing it
`/phase-status`

What it does:
- reads `.opencode/plans/current-phase.md`
- reports status, goal, scope, validation, next step
- does not replan or implement

## Phase file

Single workflow state file:

`.opencode/plans/current-phase.md`

Expected statuses:
- `DRAFT`
- `IN_PROGRESS`
- `COMPLETE`
- `BLOCKED`

Rules:
- this is the only workflow state file
- no workflow state should go into `memory/`
- old phases are tracked through Git history, not archive files

## Agent roles

### orchestrator
Responsible for:
- selecting the next bounded phase
- writing the phase file
- delegating to builder and validator
- preventing scope creep
- replacing completed or blocked phases in place

### builder
Responsible for:
- implementing only the current phase
- keeping changes tight
- running the smallest useful validation

### validator
Responsible for:
- checking whether the phase goal was met
- confirming validation is sufficient
- returning either `PASS` or the smallest fix list

## Repo workflow rules

- one phase at a time
- prefer one module
- prefer 3 files or fewer
- no opportunistic refactors
- no extra workflow docs
- do not update `memory/` as part of workflow
- Git history is the archive

## Shell commands

### Show current phase file
`pnpm phase:show`

### Reset the phase file template
`pnpm phase:clear`

### Run repo doctor checks
`pnpm doctor`

### Verify dashboard
`pnpm verify:dashboard`

### Verify proxy
`pnpm verify:proxy`

### Verify worker
`pnpm verify:worker`

### Verify only changed areas
`pnpm verify:changed`

## Git behavior

### Pre-push hook
Every `git push` automatically runs:

`pnpm verify:changed`

### Safe push alias
`git safe-push origin main`

## Daily usage loop

### Standard flow
1. `/next-phase`
2. `/run-phase`
3. `git status`
4. `git add -A`
5. `git commit -m "your change"`
6. `git push origin main`

### Continue interrupted work
1. `/phase-status`
2. `/resume-phase`

### Steer the planner
Examples:
- `/next-phase dashboard only`
- `Create the next phase for improving proxy lineage persistence visibility. Planning only.`

## Files that matter most

### Workflow and config
- `AGENTS.md`
- `opencode.json`
- `.opencode/agents/orchestrator.md`
- `.opencode/agents/builder.md`
- `.opencode/agents/validator.md`
- `.opencode/commands/next-phase.md`
- `.opencode/commands/run-phase.md`
- `.opencode/commands/resume-phase.md`
- `.opencode/commands/phase-status.md`
- `.opencode/plans/current-phase.md`

### Dev tooling
- `.githooks/pre-push`
- `scripts/dev/verify-changed.sh`
- `scripts/dev/clear-phase.sh`
- `scripts/dev/doctor.sh`

## Quick troubleshooting

### OpenCode shows stale commands
Do a full restart of OpenCode from the repo root.

### Push fails on checks
Run:
`pnpm verify:changed`

### Unsure what phase is active
Run:
`/phase-status`

or:
`pnpm phase:show`

### Need to wipe the phase template
Run:
`pnpm phase:clear`
