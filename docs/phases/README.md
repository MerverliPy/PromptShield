# Phases

## Delivery order

1. **Phase 01A — Proxy ingress foundation**  
   Working proxy server with health check, request normalization, and chat-completions passthrough shell.

2. **Phase 01B — Event schema and persistence foundation**  
   Durable tables and request/action/savings lineage.

3. **Phase 01C — Dashboard shell**  
   Premium PWA shell with spend, savings, and recent request placeholders.

4. **Phase 02 — Deterministic policy engine**  
   Explainable per-request budget and downgrade rules as pure functions.

5. **Phase 03 — Optimizer sidecar**  
   Classification, safe compression, and quality-risk scoring behind a Python HTTP boundary.

6. **Phase 04 — Worker and recommendations**  
   Async analytics processing and simple savings recommendations.

7. **Phase 05 — Billing and production readiness**  
   Metering, plan controls, and reliability/security hardening.

## Usage

- Read this file for sequence only.
- Read `ACTIVE.md` for the one detailed phase prompt currently in play.
- Move completed phase prompts into commit history instead of keeping a growing prompt archive in-repo.
