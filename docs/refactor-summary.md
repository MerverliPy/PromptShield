# Refactor Summary

This scaffold was reduced for token efficiency by:
- merging repo map content into `docs/architecture.md`
- replacing the phase archive with `docs/phases/README.md` and `docs/phases/ACTIVE.md`
- shrinking root and local `AGENT.md` files to shared rules plus folder-specific deltas
- reducing memory files to durable state, next steps, decisions, and a brief handoff
- deleting `docs/repo-tree.txt`, `memory/TASK_BOARD.md`, `packages/db/README.md`, and the no-op `packages/observability` package
- extracting shared message types to `packages/contracts/src/messages.ts`
