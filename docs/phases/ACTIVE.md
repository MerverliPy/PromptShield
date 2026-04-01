# ACTIVE PHASE

## Name
Phase 01F — Proxy lineage event emit seam

## Goal
Add a bounded proxy-side emission seam that accepts the typed lineage event payload shell for later persistence or worker delivery.

## Files in scope
- apps/proxy/src/lib/build-lineage-event.ts
- apps/proxy/src/lib/emit-lineage-event.ts
- apps/proxy/src/routes/chat-completions.ts
- apps/proxy/src/routes/chat-completions.test.ts

## Do not touch
- packages/db/**
- packages/policy/**
- apps/dashboard/**
- apps/worker/**
- services/**
- docs/**
- memory/**

## Constraints
- control-plane seam only; no database writes
- no queue/client/provider integration
- keep route handlers thin and deterministic
- no broad refactor or contract churn

## Acceptance criteria
- proxy route maps normalized request + decision into typed lineage event payload shell
- proxy route invokes a local emission seam with the payload shell
- tests verify payload shell shape and deterministic behavior
- no changes outside listed proxy files

## Validation
- `pnpm exec tsc -p apps/proxy/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/proxy test`
- `git diff -- apps/proxy/src/lib/build-lineage-event.ts apps/proxy/src/lib/emit-lineage-event.ts apps/proxy/src/routes/chat-completions.ts apps/proxy/src/routes/chat-completions.test.ts`
