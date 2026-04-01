import type { BudgetAssessment, BudgetInput } from "./types";

export function evaluateBudget(input: BudgetInput): BudgetAssessment {
  if (input.estimatedCostUsd <= input.requestCeilingUsd) {
    return {
      estimatedCostUsd: input.estimatedCostUsd,
      requestCeilingUsd: input.requestCeilingUsd,
      overBudget: false,
      reason: "within_request_budget",
    };
  }

  return {
    estimatedCostUsd: input.estimatedCostUsd,
    requestCeilingUsd: input.requestCeilingUsd,
    overBudget: true,
    reason:
      input.priority === "critical"
        ? "critical_request_exceeds_budget"
        : "request_exceeds_budget",
  };
}
