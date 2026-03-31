# Phase 01A — Proxy Ingress Foundation

## GOAL
Create a working proxy server with health check, request normalization, and OpenAI-compatible chat-completions passthrough shell.

## FILES IN SCOPE
- `apps/proxy/src/server.ts`
- `apps/proxy/src/routes/chat-completions.ts`
- `apps/proxy/src/lib/openai-normalize.ts`
- `packages/contracts/src/proxy.ts`

## DO NOT TOUCH
- `services/optimizer/**`
- `apps/dashboard/**`
- `packages/policy/**`

## IMPLEMENTATION TASKS
1. Stand up the Fastify server and register a health route.
2. Add a `/v1/chat/completions` route with typed request parsing.
3. Normalize incoming OpenAI-style payload into an internal proxy request shape.
4. Return a stub passthrough response or provider TODO marker without adding cross-module coupling.

## CONSTRAINTS
- No database writes yet.
- No policy logic yet.
- No provider SDK sprawl; keep adapter boundary thin.
- Files should stay small and single-purpose.

## ACCEPTANCE CRITERIA
- Server starts locally.
- Health route responds.
- Chat-completions route accepts OpenAI-style JSON.
- Normalization is isolated in one helper.

## VALIDATION
- Run local server.
- POST a sample chat completion payload.
- Confirm normalized payload shape.

## COPY-PASTE PROMPT

```text
Implement the following phase:

Goal:
Create a working proxy server with health check, request normalization, and OpenAI-compatible chat-completions passthrough shell.

Files in scope:
apps/proxy/src/server.ts
apps/proxy/src/routes/chat-completions.ts
apps/proxy/src/lib/openai-normalize.ts
packages/contracts/src/proxy.ts

Do not touch:
services/optimizer/**
apps/dashboard/**
packages/policy/**

Tasks:
Stand up the Fastify server and register a health route.
Add a `/v1/chat/completions` route with typed request parsing.
Normalize incoming OpenAI-style payload into an internal proxy request shape.
Return a stub passthrough response or provider TODO marker without adding cross-module coupling.

Constraints:
No database writes yet.
No policy logic yet.
No provider SDK sprawl; keep adapter boundary thin.
Files should stay small and single-purpose.

Acceptance criteria:
Server starts locally.
Health route responds.
Chat-completions route accepts OpenAI-style JSON.
Normalization is isolated in one helper.

Validation steps:
Run local server.
POST a sample chat completion payload.
Confirm normalized payload shape.
```
