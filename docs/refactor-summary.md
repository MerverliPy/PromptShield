# Refactor Summary

This scaffold was reduced for token efficiency by:
- merging repo map content into `docs/architecture.md`
- replacing the phase archive with `docs/phases/README.md` and `docs/phases/ACTIVE.md`
- shrinking root and local `AGENT.md` files to shared rules plus folder-specific deltas
- keeping `memory/CURRENT_STATE.md` for durable architecture truth while `memory/HANDOFF.md` and `memory/TASK_BOARD.md` remain operational trackers
- keeping `memory/NEXT_STEPS.md` and `memory/DECISIONS.md` as compact durable planning records
- deleting `docs/repo-tree.txt`, `packages/db/README.md`, and the no-op `packages/observability` package
- extracting shared message types to `packages/contracts/src/messages.ts`
