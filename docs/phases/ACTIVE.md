# ACTIVE PHASE

## Name
Phase 01C — Dashboard shell

## Goal
Build the premium dashboard shell with spend, savings, and recent request placeholders backed by local view models only.

## Files in scope
- apps/dashboard/app/page.tsx
- apps/dashboard/components/dashboard-shell.tsx
- apps/dashboard/lib/view-models.ts
- apps/dashboard/lib/mock-data.ts

## Do not touch
- apps/proxy/**
- apps/worker/**
- services/**
- packages/**
- docs/**
- memory/**

## Constraints
- UI shell only; no business logic in components
- use local mock/view-model data only
- no provider, policy, or database integration in this phase
- keep pages/components thin and contract-ready

## Acceptance criteria
- dashboard renders spend, savings, and recent request placeholder sections
- page composition stays in `app/page.tsx` and display composition in `components/dashboard-shell.tsx`
- view mapping remains in `lib/view-models.ts` and local fixture data in `lib/mock-data.ts`
- no changes outside listed dashboard files

## Validation
- `pnpm --filter @promptshield/dashboard typecheck`
- run `pnpm --filter @promptshield/dashboard dev` and verify dashboard loads
- `git diff -- apps/dashboard/app/page.tsx apps/dashboard/components/dashboard-shell.tsx apps/dashboard/lib/view-models.ts apps/dashboard/lib/mock-data.ts`
