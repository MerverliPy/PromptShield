# PromptShield

Premium cost-control layer for indie AI products.

PromptShield combines:
- an OpenAI-compatible proxy request path,
- deterministic budget-aware routing,
- local durable lineage persistence and savings reads through `@promptshield/db`,
- a premium PWA savings dashboard with an explicit fallback state when durable data is unavailable.

## Quick start

```bash
pnpm install
pnpm dev:proxy
pnpm dev:dashboard
```

No `.env` file is required for the current quick start. See `.env.example` for the current local defaults.

The current quick start does not start the optimizer runtime. Optimizer HTTP ownership belongs to the Python service in `services/optimizer`; any TypeScript surface in that folder is transitional helper code.

The current quick start also does not enable durable dashboard reads by itself. Set `PROMPTSHIELD_PROXY_LINEAGE_DB` to a shared SQLite path if you want the proxy, dashboard, and worker to read/write the same local durable lineage data; otherwise the dashboard intentionally shows explicit fallback demo data.

## Optimizer command matrix

- Root compatibility aliases:
  - `pnpm run typecheck:optimizer` -> compatibility alias for TypeScript helper typecheck (`@promptshield/optimizer` `typecheck:helper`)
  - `pnpm run test:optimizer` -> compatibility alias for `pnpm run test:optimizer:python`
- Root explicit commands:
  - `pnpm run typecheck:optimizer:helper` -> TypeScript helper typecheck
  - `pnpm run test:optimizer:helper` -> TypeScript helper tests
  - `pnpm run test:optimizer:python` -> Python runtime tests
- Optimizer package scripts (`services/optimizer`):
  - `pnpm --filter @promptshield/optimizer run typecheck:helper` -> helper-only TypeScript typecheck
  - `pnpm --filter @promptshield/optimizer run test:helper` -> helper-only TypeScript tests
  - `pnpm --filter @promptshield/optimizer run test:python` -> Python runtime validation

Use `pnpm run test:optimizer:python` as the only authoritative optimizer test command. It runs the Python-owned optimizer tests through the repo-root `.venv` after `python -m venv .venv` and `.venv/bin/python -m pip install -e ./services/optimizer[test]`; no shell activation is required.

Use `pnpm run test:optimizer` only as a compatibility alias when needed.

Use `pnpm run typecheck:optimizer:helper` only for the transitional TypeScript helper path in `services/optimizer`. It does not validate the Python runtime.

## Repo layout

```text
apps/
  dashboard/   Next.js PWA shell for durable summary reads or explicit fallback demo data
  proxy/       OpenAI-compatible policy and lineage ingress
  worker/      async savings rollup jobs from durable lineage when configured
services/
  optimizer/   Python-owned optimizer runtime; TS helper surface is transitional
packages/
  contracts/   shared contracts
  policy/      deterministic routing and budget logic
  db/          local durable lineage schema and sqlite-backed read/write seams
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
