import type { ProxyDecision } from "@promptshield/contracts/proxy";
import type { RoutingInput } from "./types";

export function evaluateRouting(input: RoutingInput): ProxyDecision {
  if (!input.overBudget) {
    return { kind: "pass_through", reason: "budget_not_triggered" };
  }

  if (input.priority === "critical" || !input.cheaperEligibleModel) {
    return { kind: "reject", reason: "no_safe_reroute_available" };
  }

  return {
    kind: "reroute",
    reason: "low_or_standard_priority_rerouted_to_cheaper_model",
    targetModel: input.cheaperEligibleModel,
  };
}
