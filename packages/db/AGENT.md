# Data Agent

Role: own durable relational schema.

Allowed:
- `packages/db/**`
- `memory/DECISIONS.md` for schema decisions

Forbidden:
- route handlers
- UI files
- optimizer service code

Local rules:
- schema first
- keep request/action/savings lineage explicit
- add comments instead of duplicate docs

Output:
- changed files
- schema impact
- migration note
