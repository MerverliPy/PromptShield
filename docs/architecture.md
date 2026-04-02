# Architecture

## System boundary

PromptShield currently exposes four runtime surfaces, but the local quick start only starts the proxy and dashboard.

1. **Dashboard**
   - Next.js PWA
   - reads durable lineage summaries through `@promptshield/db` when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set
   - falls back to explicit demo data when durable reads are unavailable or unconfigured

2. **Proxy**
   - OpenAI-compatible HTTP service
   - request normalization and deterministic request evaluation
   - lineage event emission and optional local sqlite persistence through `@promptshield/db`
   - explicit degraded persistence signaling through `/health` and route headers when sqlite persistence is unavailable

3. **Optimizer**
   - Python service
   - owns the optimizer HTTP boundary, including `/optimize`
   - current TypeScript code in `services/optimizer` is helper-only and not the optimizer HTTP authority

4. **Worker**
   - async jobs for savings rollups
   - reads durable lineage inputs when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set
   - falls back to an explicit empty source when durable lineage data is unavailable

## Core data flow

```text
Client App
  -> Proxy
    -> Policy Engine
      -> allow | downgrade | reject
    -> Lineage payload emission
    -> Optional local SQLite lineage persistence via @promptshield/db
      -> Dashboard durable summary read model
      -> Worker savings rollup source

When durable persistence is unavailable, the proxy stays up but reports degraded lineage persistence explicitly, and the dashboard falls back to labeled demo data.
```

## Repo boundaries

### `apps/dashboard`
Purpose: premium UI, not business logic.
- `app/` route segments
- `components/` page composition only
- reads contract-backed durable summaries when available
- otherwise renders explicit fallback/demo state

### `apps/proxy`
Purpose: OpenAI-compatible ingress and deterministic policy evaluation.
- `src/routes/` protocol handlers
- `src/lib/` request shaping and transport helpers
- keep request handlers thin and deterministic

### `apps/worker`
Purpose: background jobs only.
- savings rollups
- explicit fallback to an empty source when durable lineage is unavailable
- never sits in the request path

### `services/optimizer`
Purpose: AI sidecar.
- `app/api/` FastAPI routes
- owns `/optimize` and other optimizer HTTP endpoints
- `app/services/` classifier, compressor, risk
- `app/schemas/` request and response models
- optimizer verification is Python-owned; see `README.md` for command usage, with `pnpm run test:optimizer:python` as the authoritative test path and `pnpm run typecheck:optimizer:helper` limited to helper code

### `packages/contracts`
Purpose: versioned shared interfaces.
- request contracts
- event payloads
- savings payloads
- recommendation contracts

### `packages/policy`
Purpose: pure functions for budget and routing decisions.
- no database calls
- no network calls
- explainable outputs only

### `packages/db`
Purpose: explicit durable lineage schema plus sqlite-backed read/write seams.

### `packages/ui`
Purpose: shared presentational primitives only.

## Hard boundaries

- Dashboard never imports proxy internals.
- Proxy never imports dashboard code.
- Policy package has no network or database calls.
- Optimizer returns structured outputs; it does not mutate database state directly.
- Python is the only optimizer HTTP authority; TypeScript recommendation surfaces are helper-only and do not own `/optimize`.
- Worker writes aggregates and recommendations; it does not sit in the request path.

## Token-efficiency rules

- keep files small and single-purpose
- prefer shared contracts over duplicate local types
- read `memory/HANDOFF.md` first, then only the active phase and files in scope
- split work that spans more than one app or package
