import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { evaluateRequest } from "@promptshield/policy/index";
import { buildLineageEventPayload } from "../lib/build-lineage-event";
import { emitLineageEvent } from "../lib/emit-lineage-event";
import { normalizeOpenAIChatRequest } from "../lib/openai-normalize";
import { registerChatCompletionsRoute } from "./chat-completions";

test("chat completions returns an allow decision for a valid request", async () => {
  const app = Fastify();
  registerChatCompletionsRoute(app);

  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "gpt-4.1",
        messages: [{ role: "user", content: "Summarize the latest request." }],
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.kind, "allow");
    assert.equal(body.reason, "within_request_budget");
    assert.equal(body.requestedModel, "gpt-4.1");
    assert.equal(body.targetModel, "gpt-4.1");
    assert.equal(body.priority, "standard");
    assert.equal(body.budget.requestCeilingUsd, 0.02);
    assert.equal(body.budget.overBudget, false);
    assert.equal(typeof body.lineage?.requestId, "string");
    assert.ok(body.lineage.requestId.startsWith("req_"));
  } finally {
    await app.close();
  }
});

test("chat completions rejects an invalid request with typed issues", async () => {
  const app = Fastify();
  registerChatCompletionsRoute(app);

  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "",
        messages: [],
      },
    });

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.json(), {
      kind: "reject",
      reason: "invalid_request",
      issues: [
        { field: "model", reason: "model must be a non-empty string" },
        { field: "messages", reason: "messages must be a non-empty array" },
      ],
    });
  } finally {
    await app.close();
  }
});

test("chat completions deterministically downgrades an over-budget request", async () => {
  const app = Fastify();
  registerChatCompletionsRoute(app);

  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "gpt-4.1",
        messages: [{ role: "user", content: "Draft a detailed response." }],
        max_tokens: 900,
        metadata: {
          request_ceiling_usd: "0.01",
        },
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.kind, "downgrade");
    assert.equal(body.reason, "low_or_standard_priority_rerouted_to_cheaper_model");
    assert.equal(body.requestedModel, "gpt-4.1");
    assert.equal(body.targetModel, "gpt-4.1-mini");
    assert.equal(body.priority, "standard");
    assert.equal(body.budget.requestCeilingUsd, 0.01);
    assert.equal(body.budget.overBudget, true);
    assert.equal(typeof body.lineage?.requestId, "string");
    assert.ok(body.lineage.requestId.startsWith("req_"));
  } finally {
    await app.close();
  }
});

test("chat completions generates deterministic lineage request metadata", async () => {
  const app = Fastify();
  registerChatCompletionsRoute(app);

  try {
    const payload = {
      model: "gpt-4.1",
      messages: [{ role: "user", content: "Summarize the latest request." }],
      temperature: 0.7,
      max_tokens: 256,
      metadata: {
        workspace: "acme",
      },
    };

    const firstResponse = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload,
    });

    const secondResponse = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload,
    });

    assert.equal(firstResponse.statusCode, 200);
    assert.equal(secondResponse.statusCode, 200);

    const firstBody = firstResponse.json();
    const secondBody = secondResponse.json();

    assert.equal(firstBody.lineage.requestId, secondBody.lineage.requestId);
  } finally {
    await app.close();
  }
});

test("buildLineageEventPayload maps request and downgrade decision into stable shell", () => {
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

  const decision = evaluateRequest(normalized.value);
  const event = buildLineageEventPayload({ request: normalized.value, decision });

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
    action: {
      actionType: "model_reroute",
      reason: "low_or_standard_priority_rerouted_to_cheaper_model",
      beforeValue: 0.02721,
      afterValue: 0.02721,
    },
    lineage: {
      requestEventId: undefined,
      actionId: undefined,
    },
  });
});

test("buildLineageEventPayload is deterministic for equivalent inputs", () => {
  const payload = {
    model: "gpt-4.1",
    messages: [{ role: "user", content: "Summarize the latest request." }],
    temperature: 0.7,
    max_tokens: 256,
    metadata: {
      workspace: "acme",
    },
  };
  const firstNormalized = normalizeOpenAIChatRequest(payload);
  const secondNormalized = normalizeOpenAIChatRequest(payload);

  assert.equal(firstNormalized.ok, true);
  assert.equal(secondNormalized.ok, true);

  if (!firstNormalized.ok || !secondNormalized.ok) {
    return;
  }

  const firstEvent = buildLineageEventPayload({
    request: firstNormalized.value,
    decision: evaluateRequest(firstNormalized.value),
  });
  const secondEvent = buildLineageEventPayload({
    request: secondNormalized.value,
    decision: evaluateRequest(secondNormalized.value),
  });

  assert.deepEqual(firstEvent, secondEvent);
});

test("emitLineageEvent logs the typed lineage payload locally", () => {
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

  const payload = buildLineageEventPayload({
    request: normalized.value,
    decision: evaluateRequest(normalized.value),
  });

  assert.notEqual(payload, null);

  if (!payload) {
    return;
  }

  const calls: Array<{ payload: unknown; message: string | undefined }> = [];

  emitLineageEvent({
    payload,
    log: {
      debug(...args: unknown[]) {
        const [payload, message] = args as [unknown, string | undefined];
        calls.push({ payload, message });
      },
    },
  });

  assert.deepEqual(calls, [
    {
      payload: { lineageEvent: payload },
      message: "Proxy lineage event payload shell",
    },
  ]);
});
