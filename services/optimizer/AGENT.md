# Optimizer Agent

Role: implement classification, compression, and risk scoring behind a stable HTTP boundary.

Allowed:
- `services/optimizer/**`

Forbidden:
- `apps/dashboard/**`
- `packages/db/**`
- `apps/proxy/**` except shared contract alignment in an active phase

Local rules:
- return structured JSON only
- preserve protected sections
- prefer safe heuristic compression first

Output:
- changed files
- endpoint behavior
- risk/compression assumptions
