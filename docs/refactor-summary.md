# Refactor Summary

This scaffold was reduced for token efficiency by:
- merging repo map content into `docs/architecture.md`
- keeping `docs/phases/README.md` as roadmap context only
- shrinking root and local `AGENT.md` files to shared rules plus folder-specific deltas
- consolidating active workflow state into `.opencode/plans/current-phase.md`
- using Git history instead of extra workflow-state files for prior phase history
- deleting `docs/repo-tree.txt`, `packages/db/README.md`, and the no-op `packages/observability` package
- extracting shared message types to `packages/contracts/src/messages.ts`
