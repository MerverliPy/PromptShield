import type {
  ProxyChatDecision,
  ProxyChatRequest,
  ProxyRequestPriority,
} from "@promptshield/contracts/proxy";
import { evaluateBudget } from "./evaluate-budget";
import { evaluateRouting } from "./evaluate-routing";

type ModelPolicy = {
  requestCeilingUsd: number;
  estimatedCostPer1kTokensUsd: number;
  cheaperEligibleModel?: string;
};

const DEFAULT_REQUEST_CEILING_USD = 0.02;
const DEFAULT_MODEL_POLICY: ModelPolicy = {
  requestCeilingUsd: DEFAULT_REQUEST_CEILING_USD,
  estimatedCostPer1kTokensUsd: 0.03,
};

const MODEL_POLICIES: Record<string, ModelPolicy> = {
  "gpt-4.1": {
    requestCeilingUsd: 0.02,
    estimatedCostPer1kTokensUsd: 0.03,
    cheaperEligibleModel: "gpt-4.1-mini",
  },
  "gpt-4.1-mini": {
    requestCeilingUsd: 0.01,
    estimatedCostPer1kTokensUsd: 0.01,
    cheaperEligibleModel: "gpt-4.1-nano",
  },
  "gpt-4.1-nano": {
    requestCeilingUsd: 0.005,
    estimatedCostPer1kTokensUsd: 0.005,
  },
};

export function evaluateRequest(request: ProxyChatRequest): ProxyChatDecision {
  const modelPolicy = MODEL_POLICIES[request.model] ?? DEFAULT_MODEL_POLICY;
  const priority = getPriority(request.tags.priority);
  const requestCeilingUsd = getRequestCeilingUsd(
    request.tags.request_ceiling_usd,
    modelPolicy.requestCeilingUsd,
  );
  const estimatedCostUsd = estimateCostUsd(request, modelPolicy.estimatedCostPer1kTokensUsd);
  const budget = evaluateBudget({
    requestedModel: request.model,
    estimatedCostUsd,
    requestCeilingUsd,
    priority,
  });
  const routing = evaluateRouting({
    requestedModel: request.model,
    cheaperEligibleModel: modelPolicy.cheaperEligibleModel,
    priority,
    overBudget: budget.overBudget,
  });

  if (routing.kind === "reject") {
    return {
      kind: "reject",
      reason: routing.reason,
      requestedModel: request.model,
      priority,
      budget: {
        estimatedCostUsd: budget.estimatedCostUsd,
        requestCeilingUsd: budget.requestCeilingUsd,
        overBudget: budget.overBudget,
      },
    };
  }

  return {
    kind: routing.kind,
    reason: budget.overBudget ? routing.reason : budget.reason,
    requestedModel: request.model,
    targetModel: routing.targetModel ?? request.model,
    priority,
    budget: {
      estimatedCostUsd: budget.estimatedCostUsd,
      requestCeilingUsd: budget.requestCeilingUsd,
      overBudget: budget.overBudget,
    },
  };
}

function getPriority(value?: string): ProxyRequestPriority {
  if (value === "critical" || value === "low") {
    return value;
  }

  return "standard";
}

function getRequestCeilingUsd(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function estimateCostUsd(
  request: ProxyChatRequest,
  estimatedCostPer1kTokensUsd: number,
): number {
  const promptCharacters = request.messages.reduce(
    (total, message) => total + message.content.length,
    0,
  );
  const estimatedPromptTokens = Math.max(1, Math.ceil(promptCharacters / 4));
  const estimatedTotalTokens = estimatedPromptTokens + request.controls.maxTokens;
  const estimatedCostUsd =
    (estimatedTotalTokens / 1000) * estimatedCostPer1kTokensUsd;

  return Number(estimatedCostUsd.toFixed(6));
}
