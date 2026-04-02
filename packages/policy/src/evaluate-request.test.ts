/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";

import type { ProxyChatRequest } from "@promptshield/contracts/proxy";
import { evaluateRequest } from "./evaluate-request";

test("evaluateRequest allows requests that stay within the default budget", () => {
  const decision = evaluateRequest(buildRequest());

  assert.deepEqual(decision, {
    kind: "allow",
    reason: "within_request_budget",
    requestedModel: "gpt-4.1",
    targetModel: "gpt-4.1",
    priority: "standard",
    budget: {
      estimatedCostUsd: 0.003,
      requestCeilingUsd: 0.02,
      overBudget: false,
    },
  });
});

test("evaluateRequest downgrades low or standard priority requests when a cheaper model is available", () => {
  const decision = evaluateRequest(
    buildRequest({
      controls: { temperature: 0, maxTokens: 999 },
      tags: { request_ceiling_usd: "0.01" },
    }),
  );

  assert.deepEqual(decision, {
    kind: "downgrade",
    reason: "low_or_standard_priority_rerouted_to_cheaper_model",
    requestedModel: "gpt-4.1",
    targetModel: "gpt-4.1-mini",
    priority: "standard",
    budget: {
      estimatedCostUsd: 0.03,
      requestCeilingUsd: 0.01,
      overBudget: true,
    },
  });
});

test("evaluateRequest rejects critical over-budget requests instead of rerouting them", () => {
  const decision = evaluateRequest(
    buildRequest({
      controls: { temperature: 0, maxTokens: 999 },
      tags: {
        priority: "critical",
        request_ceiling_usd: "0.01",
      },
    }),
  );

  assert.deepEqual(decision, {
    kind: "reject",
    reason: "no_safe_reroute_available",
    requestedModel: "gpt-4.1",
    priority: "critical",
    budget: {
      estimatedCostUsd: 0.03,
      requestCeilingUsd: 0.01,
      overBudget: true,
    },
  });
});

test("evaluateRequest falls back to standard priority and the model default ceiling for invalid tags", () => {
  const decision = evaluateRequest(
    buildRequest({
      model: "gpt-4.1-mini",
      controls: { temperature: 0, maxTokens: 999 },
      tags: {
        priority: "urgent",
        request_ceiling_usd: "0",
      },
    }),
  );

  assert.deepEqual(decision, {
    kind: "allow",
    reason: "within_request_budget",
    requestedModel: "gpt-4.1-mini",
    targetModel: "gpt-4.1-mini",
    priority: "standard",
    budget: {
      estimatedCostUsd: 0.01,
      requestCeilingUsd: 0.01,
      overBudget: false,
    },
  });
});

test("evaluateRequest uses the default model policy when a request model is unknown", () => {
  const decision = evaluateRequest(
    buildRequest({
      model: "custom-model",
      controls: { temperature: 0, maxTokens: 999 },
    }),
  );

  assert.deepEqual(decision, {
    kind: "reject",
    reason: "no_safe_reroute_available",
    requestedModel: "custom-model",
    priority: "standard",
    budget: {
      estimatedCostUsd: 0.03,
      requestCeilingUsd: 0.02,
      overBudget: true,
    },
  });
});

function buildRequest(overrides: Partial<ProxyChatRequest> = {}): ProxyChatRequest {
  return {
    model: overrides.model ?? "gpt-4.1",
    messages: overrides.messages ?? [{ role: "user", content: "a" }],
    controls: overrides.controls ?? { temperature: 0, maxTokens: 99 },
    tags: overrides.tags ?? {},
    lineage: overrides.lineage,
  };
}
