# ACTIVE PHASE

## Name
Phase 01A — Proxy ingress foundation

## Goal
Turn the existing proxy scaffold into a real ingress slice:
request -> normalize -> policy decision -> typed response

## Files in scope
- apps/proxy/src/**
- packages/contracts/src/**
- packages/policy/src/**
- apps/proxy/package.json
- packages/contracts/package.json
- packages/policy/package.json

## Do not touch
- apps/dashboard/**
- apps/worker/**
- packages/db/schema.sql
- services/optimizer/**

## Acceptance criteria
- /health returns ok
- /v1/chat/completions accepts a valid request
- request is normalized into shared proxy contract
- policy evaluation runs
- response is typed and non-stub
