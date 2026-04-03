import assert from "node:assert/strict";
import { test } from "node:test";

import type { DashboardSummary } from "@promptshield/contracts/dashboard";

import { createStaticDashboardReadModel } from "./dashboard-read-model";

const summary: DashboardSummary = {
  metrics: [{ id: "recent_outcomes", value: 3, unit: "count" }],
  recentOutcomes: [
    {
      id: "request-3",
      requestId: "support.summarize",
      decisionKind: "downgrade",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1-mini",
      realizedSavingsUsd: 4.5,
      createdAt: "2026-04-08T00:03:00.000Z",
    },
    {
      id: "request-2",
      requestId: "agent.plan",
      decisionKind: "allow",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1",
      realizedSavingsUsd: null,
      createdAt: "2026-04-08T00:02:00.000Z",
    },
    {
      id: "request-1",
      requestId: "chat.generate",
      decisionKind: "reject",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1",
      realizedSavingsUsd: null,
      createdAt: "2026-04-08T00:01:00.000Z",
    },
  ],
};

test("createStaticDashboardReadModel returns all recent outcomes when the limit is undefined", () => {
  const readModel = createStaticDashboardReadModel(summary);

  assert.deepEqual(readModel.readDashboardSummary(), summary);
  assert.deepEqual(readModel.readDashboardSummary({ recentOutcomeLimit: undefined }), summary);
});

test("createStaticDashboardReadModel returns no recent outcomes for negative limits", () => {
  const readModel = createStaticDashboardReadModel(summary);

  assert.deepEqual(readModel.readDashboardSummary({ recentOutcomeLimit: -1 }).recentOutcomes, []);
});

test("createStaticDashboardReadModel truncates fractional limits to a non-negative integer", () => {
  const readModel = createStaticDashboardReadModel(summary);

  assert.deepEqual(readModel.readDashboardSummary({ recentOutcomeLimit: 1.9 }).recentOutcomes, summary.recentOutcomes.slice(0, 1));
});

test("createStaticDashboardReadModel returns no recent outcomes for non-finite limits", () => {
  const readModel = createStaticDashboardReadModel(summary);

  assert.deepEqual(readModel.readDashboardSummary({ recentOutcomeLimit: Number.POSITIVE_INFINITY }).recentOutcomes, []);
  assert.deepEqual(readModel.readDashboardSummary({ recentOutcomeLimit: Number.NaN }).recentOutcomes, []);
});
