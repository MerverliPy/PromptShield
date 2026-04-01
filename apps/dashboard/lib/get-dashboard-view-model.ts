import { createStaticDashboardReadModel } from "../../../packages/db/src/dashboard-read-model";
import { createDashboardViewModel, type DashboardViewModelSource } from "./view-models";
import { getFallbackDashboardViewModel } from "./mock-data";

const dashboardReadModel = createStaticDashboardReadModel(createPreviewDashboardSummary());

export function getDashboardViewModel() {
  try {
    const summary = dashboardReadModel.readDashboardSummary({ recentOutcomeLimit: 3 });

    return createDashboardViewModel(summary, {
      dataIndicator: "Read-model preview",
    });
  } catch {
    return getFallbackDashboardViewModel();
  }
}

function createPreviewDashboardSummary(): DashboardViewModelSource {
  return {
    metrics: [
      {
        id: "monthly_spend",
        value: 482.1,
        unit: "usd",
      },
      {
        id: "recovered_margin",
        value: 91.34,
        unit: "usd",
      },
      {
        id: "optimized_requests",
        value: 38,
        unit: "count",
      },
      {
        id: "recent_outcomes",
        value: 3,
        unit: "count",
      },
    ],
    recentOutcomes: [
      {
        id: "chat-generate",
        requestId: "chat.generate",
        decisionKind: "allow",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1",
        realizedSavingsUsd: 19,
        createdAt: "2026-04-01T00:00:00.000Z",
      },
      {
        id: "support-summarize",
        requestId: "support.summarize",
        decisionKind: "downgrade",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1-mini",
        realizedSavingsUsd: 12.5,
        createdAt: "2026-04-01T00:05:00.000Z",
      },
      {
        id: "agent-plan",
        requestId: "agent.plan",
        decisionKind: "allow",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1",
        realizedSavingsUsd: null,
        createdAt: "2026-04-01T00:10:00.000Z",
      },
    ],
  };
}
