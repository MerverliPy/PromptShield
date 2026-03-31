export type RequestPriority = "critical" | "standard" | "low";

export type BudgetInput = {
  estimatedCostUsd: number;
  requestCeilingUsd: number;
  priority: RequestPriority;
};

export type RoutingInput = {
  requestedModel: string;
  cheaperEligibleModel?: string;
  priority: RequestPriority;
  overBudget: boolean;
};
