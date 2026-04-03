#!/usr/bin/env bash
set -euo pipefail

cat > .opencode/plans/current-phase.md <<'PHASE'
# Current Phase

Status: DRAFT

## Goal

## Why this phase is next

## In scope

## Out of scope

## Tasks
- ...

## Validation
- ...

## Acceptance criteria
- ...
PHASE

echo "Reset .opencode/plans/current-phase.md"
