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
- updating completion summary when a phase is done

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
- classifying failure as:
  - `scope drift`
  - `acceptance gap`
  - `insufficient validation`
  - `boundary violation`
  - `test regression`

### shipper
Responsible for:
- reading the completed phase
- generating a commit message from context
- calling `pnpm phase:ship -- "<message>"`
- refusing to ship incomplete phases

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
