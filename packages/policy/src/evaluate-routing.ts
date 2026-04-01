import type { RoutingAssessment, RoutingInput } from "./types";

export function evaluateRouting(input: RoutingInput): RoutingAssessment {
  if (!input.overBudget) {
    return {
      kind: "allow",
      reason: "budget_not_triggered",
      targetModel: input.requestedModel,
    };
  }

  if (input.priority === "critical" || !input.cheaperEligibleModel) {
    return { kind: "reject", reason: "no_safe_reroute_available" };
  }

  return {
    kind: "downgrade",
    reason: "low_or_standard_priority_rerouted_to_cheaper_model",
    targetModel: input.cheaperEligibleModel,
  };
}
