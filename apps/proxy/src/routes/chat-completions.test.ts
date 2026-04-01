import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
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
  } finally {
    await app.close();
  }
});
