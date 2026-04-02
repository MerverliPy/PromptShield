import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  type LineageEventWriteAdapter,
  type ProxyPersistedLineageWrite,
} from "@promptshield/db";
import { evaluateRequest } from "@promptshield/policy/index";
import { buildLineageEventPayload } from "../lib/build-lineage-event";
import { emitLineageEvent } from "../lib/emit-lineage-event";
import { normalizeOpenAIChatRequest } from "../lib/openai-normalize";
import { persistLineageEvent } from "../lib/persist-lineage-event";
import { buildServer } from "../server";
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
    action: null,
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

test("persistLineageEvent writes through the db seam when an adapter is provided", async () => {
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

  const writes: Array<{ step: string; payload: unknown }> = [];
  const debugCalls: Array<{ payload: unknown; message: string | undefined }> = [];
  const adapter: LineageEventWriteAdapter = {
    async writeRequestEvent(request) {
      writes.push({ step: "request", payload: request });

      return {
        id: "request-event-1",
        createdAt: "2026-04-01T00:00:00.000Z",
        ...request,
      };
    },
    async writeOptimizationAction(action) {
      writes.push({ step: "action", payload: action });

      return {
        id: "action-1",
        createdAt: "2026-04-01T00:00:01.000Z",
        ...action,
      };
    },
    async writeSavingsRecord(savings) {
      writes.push({ step: "savings", payload: savings });

      return {
        id: "savings-1",
        createdAt: "2026-04-01T00:00:02.000Z",
        ...savings,
      };
    },
  };

  await persistLineageEvent({
    payload,
    adapter,
    log: {
      debug(...args: unknown[]) {
        const [payload, message] = args as [unknown, string | undefined];
        debugCalls.push({ payload, message });
      },
      warn() {},
    },
  });

  const expectedWrite: ProxyPersistedLineageWrite = {
    request: {
      workspaceId: "acme",
      apiRouteId: null,
      requestId: normalized.value.lineage?.requestId ?? "",
      modelRequested: "gpt-4.1",
      modelServed: "gpt-4.1-mini",
      inputTokens: 0,
      outputTokens: null,
      estimatedCostUsd: 0.02721,
      decisionKind: "downgrade",
    },
  };

  assert.deepEqual(writes, [{ step: "request", payload: expectedWrite.request }]);
  assert.deepEqual(debugCalls, [
    {
      payload: { lineageWrite: expectedWrite },
      message: "Proxy lineage write payload shell",
    },
    {
      payload: {
        lineageResult: {
          request: {
            id: "request-event-1",
            createdAt: "2026-04-01T00:00:00.000Z",
            ...expectedWrite.request,
          },
        },
      },
      message: "Proxy lineage persisted through db seam",
    },
  ]);
});

test("persistLineageEvent keeps allow decisions as request-only writes", async () => {
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

  const payload = buildLineageEventPayload({
    request: normalized.value,
    decision: evaluateRequest(normalized.value),
  });

  assert.notEqual(payload, null);

  if (!payload) {
    return;
  }

  const writes: Array<{ step: string; payload: unknown }> = [];

  await persistLineageEvent({
    payload,
    adapter: {
      async writeRequestEvent(request) {
        writes.push({ step: "request", payload: request });

        return {
          id: "request-event-allow",
          createdAt: "2026-04-01T00:00:10.000Z",
          ...request,
        };
      },
      async writeOptimizationAction(action) {
        writes.push({ step: "action", payload: action });

        return {
          id: "action-allow",
          createdAt: "2026-04-01T00:00:11.000Z",
          ...action,
        };
      },
      async writeSavingsRecord(savings) {
        writes.push({ step: "savings", payload: savings });

        return {
          id: "savings-allow",
          createdAt: "2026-04-01T00:00:12.000Z",
          ...savings,
        };
      },
    },
    log: {
      debug() {},
      warn() {},
    },
  });

  assert.deepEqual(writes, [
    {
      step: "request",
      payload: {
        workspaceId: "acme",
        apiRouteId: null,
        requestId: normalized.value.lineage?.requestId ?? "",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1",
        inputTokens: 0,
        outputTokens: null,
        estimatedCostUsd: 0.00792,
        decisionKind: "allow",
      },
    },
  ]);
});

test("persistLineageEvent tolerates db seam failures", async () => {
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

  const warningCalls: Array<{ payload: unknown; message: string | undefined }> = [];

  await persistLineageEvent({
    payload,
    adapter: {
      async writeRequestEvent() {
        throw new Error("db unavailable");
      },
    },
    log: {
      debug() {},
      warn(...args: unknown[]) {
        const [payload, message] = args as [unknown, string | undefined];
        warningCalls.push({ payload, message });
      },
    },
  });

  assert.equal(warningCalls.length, 1);
  assert.equal(warningCalls[0]?.message, "Proxy lineage persistence failed");
});

test("buildServer persists downgrade lineage through the default sqlite adapter", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-proxy-"));
  const databasePath = join(tempDirectory, "lineage.sqlite");
  const app = await buildServer({ lineageDatabasePath: databasePath });

  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "gpt-4.1",
        messages: [{ role: "user", content: "Draft a detailed response." }],
        max_tokens: 900,
        metadata: {
          workspace: "acme",
          request_ceiling_usd: "0.01",
        },
      },
    });

    assert.equal(response.statusCode, 200);

    await waitFor(() => {
      const requestRows = readSqliteJson(databasePath, "SELECT request_id, model_requested, model_served FROM request_events");
      const actionRows = readSqliteJson(databasePath, "SELECT action_type, before_value, after_value FROM optimization_actions");
      const savingsRows = readSqliteJson(databasePath, "SELECT gross_cost_usd, optimized_cost_usd, realized_savings_usd, source FROM savings_records");

      assert.deepEqual(requestRows, [
        {
          request_id: response.json().lineage.requestId,
          model_requested: "gpt-4.1",
          model_served: "gpt-4.1-mini",
        },
      ]);
      assert.deepEqual(actionRows, []);
      assert.deepEqual(savingsRows, []);
    });
  } finally {
    await app.close();
    await delay(50);
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("chat completions tolerates configured persistence failures", async () => {
  const app = Fastify();
  registerChatCompletionsRoute(app, {
    lineageAdapter: {
      async writeRequestEvent() {
        throw new Error("db unavailable");
      },
    },
  });

  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "gpt-4.1",
        messages: [{ role: "user", content: "Draft a detailed response." }],
        max_tokens: 900,
        metadata: {
          workspace: "acme",
          request_ceiling_usd: "0.01",
        },
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().kind, "downgrade");
  } finally {
    await app.close();
  }
});

function readSqliteJson(databasePath: string, sql: string): Array<Record<string, unknown>> {
  try {
    const output = execFileSync("sqlite3", ["-json", databasePath, sql], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    return output ? (JSON.parse(output) as Array<Record<string, unknown>>) : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("no such table") || message.includes("database is locked")) {
      return [];
    }

    throw error;
  }
}

async function waitFor(check: () => void): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      check();
      return;
    } catch (error) {
      lastError = error;
      await delay(25);
    }
  }

  throw lastError;
}
