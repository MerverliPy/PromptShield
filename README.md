# PromptShield

Premium cost-control layer for indie AI products.

PromptShield combines:
- an OpenAI-compatible proxy,
- deterministic budget-aware routing,
- quality-preserving prompt/context optimization,
- a premium PWA savings dashboard.

## Quick start

```bash
pnpm install
pnpm dev:proxy
pnpm dev:dashboard
```

No `.env` file is required for the current quick start. See `.env.example` for the current local defaults.

The current quick start does not start the optimizer runtime. Optimizer HTTP ownership belongs to the Python service in `services/optimizer`; any TypeScript surface in that folder is transitional helper code.

## Repo layout

```text
apps/
  dashboard/   Next.js PWA shell
  proxy/       OpenAI-compatible gateway
  worker/      async analytics and recommendation jobs
services/
  optimizer/   Python-owned optimizer runtime; TS helper surface is transitional
packages/
  contracts/   shared contracts
  policy/      deterministic routing and budget logic
  db/          durable relational schema
  ui/          shared presentational primitives
docs/
  architecture.md
  phases/
memory/
  CURRENT_STATE.md
  NEXT_STEPS.md
  DECISIONS.md
  HANDOFF.md
```

## Principles

- deterministic core, AI-assisted edge
- small context over broad context
- thin apps, thick domain packages
- explainability first

See `docs/architecture.md` for boundaries and data flow.
See `docs/phases/README.md` for delivery order and `docs/phases/ACTIVE.md` for the current execution prompt.
