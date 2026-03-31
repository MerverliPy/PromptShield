# DECISIONS

## D-001: Monorepo with apps + services + packages
- Reason: separates dashboard, proxy, worker, optimizer, and shared contracts.
- Impact: enables folder-local agent scope and smaller context windows.

## D-002: TypeScript product surfaces with Python optimizer sidecar
- Reason: keeps dashboard/proxy velocity high while isolating AI-heavy logic.
- Impact: contract boundaries must stay explicit.

## D-003: Deterministic policy engine separate from optimizer
- Reason: budgets and routing must stay explainable.
- Impact: `packages/policy` remains pure and side-effect free.

## D-004: Event-first savings lineage
- Reason: savings claims need request, action, and savings traceability.
- Impact: schema and contracts prioritize lineage over aggregates.

## D-005: Root agent plus thin local agent deltas
- Reason: preserves scope control without repeating the same boilerplate in every folder.
- Impact: local `AGENT.md` files stay short and folder-specific.
