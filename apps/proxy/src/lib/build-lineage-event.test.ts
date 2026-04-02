import assert from "node:assert/strict";
import test from "node:test";

import { evaluateRequest } from "@promptshield/policy/index";
import { buildLineageEventPayload } from "./build-lineage-event";
import { normalizeOpenAIChatRequest } from "./openai-normalize";

test("buildLineageEventPayload omits misleading downgrade action shells", () => {
  const normalized = normalizeOpenAIChatRequest({
    model: "gpt-4.1",
    messages: [{ role: "user", content: "Draft a detailed response." }],
    max_tokens: 900,
    metadata: {
      workspace: "acme",
      request_ceiling_usd: "0.01",
    },
  });

  assert.equal(normalized.ok, true);

  if (!normalized.ok) {
    return;
  }

  const event = buildLineageEventPayload({
    request: normalized.value,
    decision: evaluateRequest(normalized.value),
  });

  assert.deepEqual(event, {
    request: {
      requestId: normalized.value.lineage?.requestId,
      decisionKind: "downgrade",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1-mini",
      estimatedCostUsd: 0.02721,
      requestCeilingUsd: 0.01,
      overBudget: true,
      priority: "standard",
      tags: [
        { key: "request_ceiling_usd", value: "0.01" },
        { key: "workspace", value: "acme" },
      ],
    },
    action: null,
    lineage: {
      requestEventId: undefined,
      actionId: undefined,
    },
  });
});

test("buildLineageEventPayload keeps reject action shells truthful", () => {
  const normalized = normalizeOpenAIChatRequest({
    model: "gpt-4.1",
    messages: [{ role: "user", content: "Draft a detailed response." }],
    max_tokens: 900,
    metadata: {
      workspace: "acme",
      request_ceiling_usd: "0.01",
      priority: "critical",
    },
  });

  assert.equal(normalized.ok, true);

  if (!normalized.ok) {
    return;
  }

  const event = buildLineageEventPayload({
    request: normalized.value,
    decision: evaluateRequest(normalized.value),
  });

  assert.deepEqual(event, {
    request: {
      requestId: normalized.value.lineage?.requestId,
      decisionKind: "reject",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1",
      estimatedCostUsd: 0.02721,
      requestCeilingUsd: 0.01,
      overBudget: true,
      priority: "critical",
      tags: [
        { key: "priority", value: "critical" },
        { key: "request_ceiling_usd", value: "0.01" },
        { key: "workspace", value: "acme" },
      ],
    },
    action: {
      actionType: "request_reject",
      reason: "no_safe_reroute_available",
      beforeValue: 0.02721,
      afterValue: 0,
    },
    lineage: {
      requestEventId: undefined,
      actionId: undefined,
    },
  });
});

test("buildLineageEventPayload keeps allow actions absent", () => {
  const normalized = normalizeOpenAIChatRequest({
    model: "gpt-4.1",
    messages: [{ role: "user", content: "Summarize the latest request." }],
    metadata: {
      workspace: "acme",
    },
  });

  assert.equal(normalized.ok, true);

  if (!normalized.ok) {
    return;
  }

  const event = buildLineageEventPayload({
    request: normalized.value,
    decision: evaluateRequest(normalized.value),
  });

  assert.deepEqual(event, {
    request: {
      requestId: normalized.value.lineage?.requestId,
      decisionKind: "allow",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1",
      estimatedCostUsd: 0.00792,
      requestCeilingUsd: 0.02,
      overBudget: false,
      priority: "standard",
      tags: [{ key: "workspace", value: "acme" }],
    },
    action: null,
    lineage: {
      requestEventId: undefined,
      actionId: undefined,
    },
  });
});
