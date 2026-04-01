# ACTIVE PHASE

## Name
Phase 01B — Event schema and persistence foundation

## Goal
Add the first durable request/action/savings lineage schema and aligned event contract types without changing app runtime behavior.

## Files in scope
- packages/db/schema.sql
- packages/contracts/src/events.ts
- packages/contracts/src/proxy.ts

## Do not touch
- apps/**
- services/**
- packages/policy/**
- packages/ui/**
- docs/**
- memory/**

## Constraints
- schema-first changes only
- keep request/action/savings lineage explicit
- no route-handler, UI, or worker logic edits
- no broad refactor outside listed files

## Acceptance criteria
- `packages/db/schema.sql` defines durable lineage tables for request, action, and savings relationships
- `packages/contracts/src/events.ts` exports event types that map to the new lineage records
- `packages/contracts/src/proxy.ts` stays aligned with event payload identifiers where needed
- no app/service source files are changed

## Validation
- `pnpm --filter @promptshield/contracts typecheck`
- verify schema includes explicit request -> action -> savings lineage keys
- `git diff -- packages/db/schema.sql packages/contracts/src/events.ts packages/contracts/src/proxy.ts`
