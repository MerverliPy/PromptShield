import type { DecisionKind } from "@promptshield/contracts/durable";

export type DashboardMetricUnit = "count" | "usd";

export type DashboardMetricSummary = {
  id: string;
  value: number;
  unit: DashboardMetricUnit;
};

export type DashboardRecentOutcomeSummary = {
  id: string;
  requestId: string;
  decisionKind: DecisionKind;
  modelRequested: string;
  modelServed: string;
  realizedSavingsUsd: number | null;
  createdAt: string;
};

export type DashboardSummary = {
  metrics: DashboardMetricSummary[];
  recentOutcomes: DashboardRecentOutcomeSummary[];
};
