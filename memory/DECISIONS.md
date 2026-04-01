# DECISIONS

updated_at: 2026-04-01
phase: durable
status: active

## D-001: Monorepo with apps + services + packages
- Reason: separates dashboard, proxy, worker, optimizer, and shared contracts
- Impact: supports narrow file scopes and smaller context windows

## D-002: TypeScript product surfaces with Python optimizer sidecar
- Reason: keep dashboard and proxy velocity high while isolating AI-heavy logic
- Impact: contracts must stay explicit and versioned
- Risk note: runtime ownership should be simplified if split responsibility increases drift

## D-003: Deterministic policy engine separate from optimizer
- Reason: budgets and routing must stay explainable
- Impact: `packages/policy` remains pure and side-effect free

## D-004: Event-first savings lineage
- Reason: savings claims need request, action, and savings traceability
- Impact: schema and contracts prioritize lineage before aggregates

## D-005: Root agent plus thin local agent deltas
- Reason: preserve scope control without repeating boilerplate
- Impact: local `AGENT.md` files stay short but must still include scope, rules, workflow, and token policy

## D-006: Python owns optimizer HTTP runtime
- Reason: one runtime must own `/optimize` to avoid split authority between TypeScript and Python surfaces
- Impact: `services/optimizer` is the durable HTTP authority for optimizer requests
- Impact: TypeScript recommendation surfaces remain helper-only contract and orchestration layers unless explicitly retired later
