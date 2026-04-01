import type {
  OptimizationActionEvent,
  RequestEventRecord,
} from "@promptshield/contracts/events";
import type { ProxyChatDecision, ProxyChatRequest } from "@promptshield/contracts/proxy";

type ProxyDecisionWithBudget = Extract<ProxyChatDecision, { budget: unknown }>;
type ProxyDecisionWithPriority = Extract<ProxyChatDecision, { priority: unknown }>;

export type ProxyLineageEventPayload = {
  request: {
    requestId: RequestEventRecord["requestId"];
    decisionKind: RequestEventRecord["decisionKind"];
    modelRequested: RequestEventRecord["modelRequested"];
    modelServed: RequestEventRecord["modelServed"];
    estimatedCostUsd: RequestEventRecord["estimatedCostUsd"];
    requestCeilingUsd: ProxyDecisionWithBudget["budget"]["requestCeilingUsd"] | null;
    overBudget: ProxyDecisionWithBudget["budget"]["overBudget"] | null;
    priority: ProxyDecisionWithPriority["priority"] | null;
    tags: Array<{ key: string; value: string }>;
  };
  action:
    | {
        actionType: OptimizationActionEvent["actionType"];
        reason: OptimizationActionEvent["reason"];
        beforeValue: OptimizationActionEvent["beforeValue"];
        afterValue: OptimizationActionEvent["afterValue"];
      }
    | null;
  lineage: {
    requestEventId?: RequestEventRecord["id"];
    actionId?: OptimizationActionEvent["id"];
  };
};

export function buildLineageEventPayload(input: {
  request: ProxyChatRequest;
  decision: ProxyChatDecision;
}): ProxyLineageEventPayload | null {
  const requestId = input.request.lineage?.requestId;

  if (!requestId) {
    return null;
  }

  const requestModel = input.decision.requestedModel ?? input.request.model;
  const servedModel = input.decision.targetModel ?? requestModel;
  const budget = "budget" in input.decision ? input.decision.budget : undefined;
  const priority = "priority" in input.decision ? input.decision.priority : undefined;
  const requestedCostUsd = budget?.estimatedCostUsd ?? 0;

  return {
    request: {
      requestId,
      decisionKind: input.decision.kind,
      modelRequested: requestModel,
      modelServed: servedModel,
      estimatedCostUsd: requestedCostUsd,
      requestCeilingUsd: budget?.requestCeilingUsd ?? null,
      overBudget: budget?.overBudget ?? null,
      priority: priority ?? null,
      tags: Object.entries(input.request.tags)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, value })),
    },
    action: buildActionShell(input.decision, requestedCostUsd),
    lineage: {
      requestEventId: input.decision.lineage?.requestEventId,
      actionId: input.decision.lineage?.actionId,
    },
  };
}

function buildActionShell(
  decision: ProxyChatDecision,
  requestedCostUsd: number,
): ProxyLineageEventPayload["action"] {
  if (decision.kind === "allow" || decision.kind === "downgrade") {
    return null;
  }

  return {
    actionType: "request_reject",
    reason: decision.reason,
    beforeValue: decision.budget?.estimatedCostUsd ?? 0,
    afterValue: 0,
  };
}
