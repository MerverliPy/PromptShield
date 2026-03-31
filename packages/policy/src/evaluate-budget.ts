import type { ProxyDecision } from "@promptshield/contracts/proxy";
import type { BudgetInput } from "./types";

export function evaluateBudget(input: BudgetInput): ProxyDecision {
  if (input.estimatedCostUsd <= input.requestCeilingUsd) {
    return { kind: "pass_through", reason: "within_request_budget" };
  }

  if (input.priority === "critical") {
    return { kind: "reject", reason: "critical_request_exceeds_budget_without_safe_downgrade" };
  }

  return { kind: "reroute", reason: "request_exceeds_budget_and_is_downgrade_eligible", targetModel: "budget_fallback" };
}
