import type { ProxyRequestPriority } from "@promptshield/contracts/proxy";

export type RequestPriority = ProxyRequestPriority;

export type BudgetInput = {
  requestedModel: string;
  estimatedCostUsd: number;
  requestCeilingUsd: number;
  priority: RequestPriority;
};

export type BudgetAssessment = {
  estimatedCostUsd: number;
  requestCeilingUsd: number;
  overBudget: boolean;
  reason: string;
};

export type RoutingInput = {
  requestedModel: string;
  cheaperEligibleModel?: string;
  priority: RequestPriority;
  overBudget: boolean;
};

export type RoutingAssessment = {
  kind: "allow" | "downgrade" | "reject";
  reason: string;
  targetModel?: string;
};
