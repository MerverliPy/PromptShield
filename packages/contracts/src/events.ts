export type RequestEvent = {
  workspaceId: string;
  routeKey: string;
  requestId: string;
  modelRequested: string;
  modelServed: string;
  inputTokens: number;
  outputTokens?: number;
  estimatedCostUsd: number;
  decisionKind: "pass_through" | "reroute" | "compress" | "reject";
  createdAt: string;
};

export type OptimizationActionEvent = {
  requestId: string;
  actionType: string;
  beforeValue: number;
  afterValue: number;
  reason: string;
};
