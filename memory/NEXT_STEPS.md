# NEXT_STEPS

1. Execute Phase 01F in `docs/phases/ACTIVE.md` (proxy lineage event emit seam).
2. Wire proxy lineage event payload shell into a durable emit path (no-op shell exists; persistence/queue path still pending).
3. Expand deterministic policy rules and reasons in `packages/policy/**`.
4. Wire worker analytics/recommendation jobs to consume saved lineage events.
5. Build dashboard spend/savings views on durable lineage records after proxy+worker wiring.
