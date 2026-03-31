# Architecture

## System boundary

PromptShield has four runtime surfaces:

1. **Dashboard**
   - Next.js PWA
   - onboarding, settings, spend views, savings views, policy control

2. **Proxy**
   - OpenAI-compatible HTTP service
   - request normalization
   - workspace policy evaluation
   - provider dispatch
   - event emission

3. **Optimizer**
   - Python service
   - request classification
   - context compression
   - quality-risk scoring
   - recommendation generation

4. **Worker**
   - async jobs for analytics enrichment, policy recommendations, anomaly checks

## Core data flow

```text
Client App
  -> Proxy
    -> Policy Engine
      -> pass through | reroute | compress | annotate
    -> Provider
    -> Event Stream
      -> Postgres
      -> Worker
      -> Dashboard
```

## Repo boundaries

### `apps/dashboard`
Purpose: premium UI, not business logic.
- `app/` route segments
- `components/` page composition only
- dashboard orchestrates contract-backed views

### `apps/proxy`
Purpose: OpenAI-compatible ingress and provider egress.
- `src/routes/` protocol handlers
- `src/lib/` request shaping and transport helpers
- keep request handlers thin and deterministic

### `apps/worker`
Purpose: background jobs only.
- analytics enrichment
- savings rollups
- recommendation generation
- never sits in the request path

### `services/optimizer`
Purpose: AI sidecar.
- `app/api/` FastAPI routes
- `app/services/` classifier, compressor, risk
- `app/schemas/` request and response models

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
Purpose: durable relational schema and migration history.

### `packages/ui`
Purpose: shared presentational primitives only.

## Hard boundaries

- Dashboard never imports proxy internals.
- Proxy never imports dashboard code.
- Policy package has no network or database calls.
- Optimizer returns structured outputs; it does not mutate database state directly.
- Worker writes aggregates and recommendations; it does not sit in the request path.

## Token-efficiency rules

- keep files small and single-purpose
- prefer shared contracts over duplicate local types
- read `memory/HANDOFF.md` first, then only the active phase and files in scope
- split work that spans more than one app or package
