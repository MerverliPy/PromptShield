# ACTIVE PHASE

## Name
Phase 00 — OpenCode bootstrap + runnable workspace baseline

## Goal
Make the repo OpenCode-native and locally runnable without changing product logic.

## Files in scope
- AGENTS.md
- opencode.json
- .opencode/agents/**
- .opencode/commands/**
- package.json
- apps/*/package.json
- packages/*/package.json
- .env.example

## Do not touch
- apps/proxy/src/**
- apps/dashboard/app/**
- packages/policy/src/**
- services/optimizer/app/**
- packages/db/schema.sql

## Acceptance criteria
- OpenCode loads project rules
- OpenCode agents and commands exist
- workspace install succeeds
- proxy boots
- GET /health returns ok
