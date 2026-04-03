# PromptShield Workflow Cheat Sheet

## Core OpenCode commands

### Create the next bounded phase
`/next-phase`

### Execute the current phase
`/run-phase`

### Continue the active phase without replanning
`/resume-phase`

### Show current phase without changing it
`/phase-status`

### Finish the current phase
`/finish-phase`

What it does:
- summarizes the completed phase
- reports changed files, validation, residual risk, and rollback note
- suggests a commit message
- returns whether the phase is ready to ship

### Ship the current phase
`/ship-phase`

What it does:
- reads the completed phase
- generates a commit message from the active phase and diff context
- runs `pnpm phase:ship -- "<generated message>"`
- pushes the current branch
- refuses to ship unless the phase is `COMPLETE` or `PASS`

## Phase file

Single workflow state file:

`.opencode/plans/current-phase.md`

Expected statuses:
- `DRAFT`
- `IN_PROGRESS`
- `COMPLETE`
- `BLOCKED`

Structured fields:
- `Goal`
- `Why this phase is next`
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
- selects the next bounded phase
- writes the phase file
- delegates to builder and validator
- updates completion summary

### builder
- implements only the current phase
- keeps changes tight
- runs the smallest useful validation

### validator
- checks the phase goal and acceptance criteria
- returns `PASS` or the smallest fix list
- classifies failure as:
  - `scope drift`
  - `acceptance gap`
  - `insufficient validation`
  - `boundary violation`
  - `test regression`

### shipper
- reads the completed phase
- generates a commit message from context
- calls `pnpm phase:ship -- "<message>"`
- refuses to ship incomplete phases

## Shell commands

`pnpm verify:dashboard`
`pnpm verify:proxy`
`pnpm verify:worker`
`pnpm verify:changed`
`pnpm phase:show`
`pnpm phase:clear`
`pnpm doctor`
`pnpm phase:ship -- "your commit message"`

## Daily usage loop

1. `/next-phase`
2. `/run-phase`
3. `/finish-phase`
4. `/ship-phase`

## Troubleshooting

- stale commands: restart OpenCode from repo root
- push check failure: run `pnpm verify:changed`
- inspect active phase: `/phase-status` or `pnpm phase:show`
- reset phase template: `pnpm phase:clear`
