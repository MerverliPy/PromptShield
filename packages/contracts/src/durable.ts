export type DecisionKind = "allow" | "downgrade" | "reject";

export type SavingsSource = "compression" | "routing" | "combined";

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
};

export type ApiRoute = {
  id: string;
  workspaceId: string;
  routeKey: string;
  createdAt: string;
};

export type RequestEvent = {
  id: string;
  workspaceId: string;
  apiRouteId: string | null;
  requestId: string;
  modelRequested: string;
  modelServed: string;
  inputTokens: number;
  outputTokens: number | null;
  estimatedCostUsd: number;
  decisionKind: DecisionKind;
  createdAt: string;
};

export type OptimizationAction = {
  id: string;
  requestEventId: string;
  actionType: string;
  beforeValue: number;
  afterValue: number;
  reason: string;
  createdAt: string;
};

export type SavingsRecord = {
  id: string;
  requestEventId: string;
  optimizationActionId: string;
  grossCostUsd: number;
  optimizedCostUsd: number;
  realizedSavingsUsd: number;
  source: SavingsSource;
  createdAt: string;
};
