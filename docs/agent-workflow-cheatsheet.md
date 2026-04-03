# PromptShield Workflow Cheat Sheet

## Core OpenCode commands

### Refresh backlog candidates
`/refresh-backlog`

What it does:
- refreshes `.opencode/backlog/candidates.yaml`
- updates the candidate list used by `/next-phase`
- does not create a new phase

### Create the next bounded phase
`/next-phase`

What it does:
- reads `.opencode/backlog/candidates.yaml` first
- chooses the highest-value bounded candidate
- writes `.opencode/plans/current-phase.md`
- does not implement yet

### Execute the current phase
`/run-phase`

### Continue the active phase without replanning
`/resume-phase`

### Show current phase without changing it
`/phase-status`

### Finish the current phase
`/finish-phase`

### Ship the current phase
`/ship-phase`

## Backlog file

Planning input file:

`.opencode/backlog/candidates.yaml`

Rules:
- used for fast next-phase selection
- should contain concrete, bounded, high-value candidates
- should avoid generic work like coverage cleanup or broad refactors

## Phase file

Workflow state file:

`.opencode/plans/current-phase.md`

Expected statuses:
- `DRAFT`
- `IN_PROGRESS`
- `COMPLETE`
- `BLOCKED`

Structured fields:
- `Goal`
- `Why this phase is next`
- `Backlog item`
- `Primary files`
- `Expected max files changed`
- `Risk`
- `Rollback note`
- `In scope`
- `Out of scope`
- `Tasks`
- `Validation command`
- `Validation`
- `Acceptance criteria`
- `Completion summary`

## Agent roles

### orchestrator
- prefers backlog-first planning
- selects the next bounded phase
- writes the phase file
- delegates to builder and validator

### builder
- implements only the current phase

### validator
- validates the current phase

### shipper
- generates the commit message
- ships the completed phase

## Shell commands

`pnpm backlog:show`  
`pnpm phase:show`  
`pnpm phase:clear`  
`pnpm verify:changed`  
`pnpm repo:doctor`  
`pnpm phase:ship -- "your commit message"`

## Daily usage loop

1. `/refresh-backlog` occasionally
2. `/next-phase`
3. `/run-phase`
4. `/finish-phase`
5. `/ship-phase`

## Fast-path usage

- `/next-phase dashboard`
- `/next-phase proxy`
- `/next-phase highest-priority`

## Troubleshooting

- stale commands: restart OpenCode from repo root
- inspect backlog: `pnpm backlog:show`
- inspect phase: `/phase-status` or `pnpm phase:show`
- workflow health: `pnpm repo:doctor`
