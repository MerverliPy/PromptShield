/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";

import type { LineageWrite } from "./lineage-writes";
import {
  createLineageEventStore,
  writeProxyLineageEvent,
  writeLineageEvent,
  type LineageEventWriteAdapter,
  type ProxyPersistedLineageWrite,
} from "./write-lineage-event";

const requestWrite: LineageWrite["request"] = {
  workspaceId: "workspace-1",
  apiRouteId: null,
  requestId: "request-1",
  modelRequested: "gpt-4.1",
  modelServed: "gpt-4.1-mini",
  inputTokens: 42,
  outputTokens: 12,
  estimatedCostUsd: 0.14,
  decisionKind: "downgrade",
};

const actionWrite: NonNullable<LineageWrite["action"]> = {
  requestEventId: "request-event-1",
  actionType: "route-model",
  beforeValue: 10,
  afterValue: 6,
  reason: "Matched cheaper safe model",
};

const savingsWrite: NonNullable<LineageWrite["savings"]> = {
  requestEventId: "request-event-1",
  optimizationActionId: "action-1",
  grossCostUsd: 0.14,
  optimizedCostUsd: 0.08,
  realizedSavingsUsd: 0.06,
  source: "routing",
};

const proxyPersistedWrite: ProxyPersistedLineageWrite = {
  request: requestWrite,
  action: {
    actionType: "route-model",
    beforeValue: 10,
    afterValue: 6,
    reason: "Matched cheaper safe model",
  },
  savings: {
    grossCostUsd: 0.14,
    optimizedCostUsd: 0.08,
    realizedSavingsUsd: 0.06,
    source: "routing",
  },
};

test("writeLineageEvent writes the request, action, and savings in order", async () => {
  const calls: Array<{ step: string; payload: unknown }> = [];

  const adapter: LineageEventWriteAdapter = {
    async writeRequestEvent(request) {
      calls.push({ step: "request", payload: request });

      return {
        id: "request-event-1",
        createdAt: "2026-04-01T00:00:00.000Z",
        ...request,
      };
    },
    async writeOptimizationAction(action) {
      calls.push({ step: "action", payload: action });

      return {
        id: "action-1",
        createdAt: "2026-04-01T00:00:01.000Z",
        ...action,
      };
    },
    async writeSavingsRecord(savings) {
      calls.push({ step: "savings", payload: savings });

      return {
        id: "savings-1",
        createdAt: "2026-04-01T00:00:02.000Z",
        ...savings,
      };
    },
  };

  const result = await writeLineageEvent(adapter, {
    request: requestWrite,
    action: actionWrite,
    savings: savingsWrite,
  });

  assert.deepEqual(calls, [
    { step: "request", payload: requestWrite },
    { step: "action", payload: actionWrite },
    { step: "savings", payload: savingsWrite },
  ]);
  assert.deepEqual(result, {
    request: {
      id: "request-event-1",
      createdAt: "2026-04-01T00:00:00.000Z",
      ...requestWrite,
    },
    action: {
      id: "action-1",
      createdAt: "2026-04-01T00:00:01.000Z",
      ...actionWrite,
    },
    savings: {
      id: "savings-1",
      createdAt: "2026-04-01T00:00:02.000Z",
      ...savingsWrite,
    },
  });
});

test("createLineageEventStore preserves the LineageStore contract for request-only writes", async () => {
  const calls: string[] = [];

  const store = createLineageEventStore({
    async writeRequestEvent(request) {
      calls.push("request");

      return {
        id: "request-event-2",
        createdAt: "2026-04-01T00:00:03.000Z",
        ...request,
      };
    },
  });

  const result = await store.writeLineage({ request: requestWrite });

  assert.deepEqual(calls, ["request"]);
  assert.deepEqual(result, {
    request: {
      id: "request-event-2",
      createdAt: "2026-04-01T00:00:03.000Z",
      ...requestWrite,
    },
  });
});

test("writeProxyLineageEvent derives request and action ids inside the db seam", async () => {
  const calls: Array<{ step: string; payload: unknown }> = [];

  const adapter: LineageEventWriteAdapter = {
    async writeRequestEvent(request) {
      calls.push({ step: "request", payload: request });

      return {
        id: "request-event-5",
        createdAt: "2026-04-01T00:00:07.000Z",
        ...request,
      };
    },
    async writeOptimizationAction(action) {
      calls.push({ step: "action", payload: action });

      return {
        id: "action-5",
        createdAt: "2026-04-01T00:00:08.000Z",
        ...action,
      };
    },
    async writeSavingsRecord(savings) {
      calls.push({ step: "savings", payload: savings });

      return {
        id: "savings-5",
        createdAt: "2026-04-01T00:00:09.000Z",
        ...savings,
      };
    },
  };

  const result = await writeProxyLineageEvent(adapter, proxyPersistedWrite);

  assert.deepEqual(calls, [
    { step: "request", payload: requestWrite },
    {
      step: "action",
      payload: {
        requestEventId: "request-event-5",
        ...proxyPersistedWrite.action,
      },
    },
    {
      step: "savings",
      payload: {
        requestEventId: "request-event-5",
        optimizationActionId: "action-5",
        ...proxyPersistedWrite.savings,
      },
    },
  ]);
  assert.deepEqual(result, {
    request: {
      id: "request-event-5",
      createdAt: "2026-04-01T00:00:07.000Z",
      ...requestWrite,
    },
    action: {
      id: "action-5",
      createdAt: "2026-04-01T00:00:08.000Z",
      requestEventId: "request-event-5",
      ...proxyPersistedWrite.action,
    },
    savings: {
      id: "savings-5",
      createdAt: "2026-04-01T00:00:09.000Z",
      requestEventId: "request-event-5",
      optimizationActionId: "action-5",
      ...proxyPersistedWrite.savings,
    },
  });
});

test("writeLineageEvent fails clearly when action writes are requested without adapter support", async () => {
  const calls: string[] = [];

  await assert.rejects(
    writeLineageEvent(
      {
        async writeRequestEvent(request) {
          calls.push("request");

          return {
            id: "request-event-3",
            createdAt: "2026-04-01T00:00:04.000Z",
            ...request,
          };
        },
      },
      {
        request: requestWrite,
        action: actionWrite,
      },
    ),
    {
      message: "LineageEventWriteAdapter.writeOptimizationAction is required for action writes",
    },
  );

  assert.deepEqual(calls, ["request"]);
});

test("writeLineageEvent fails clearly when savings writes are requested without adapter support", async () => {
  const calls: string[] = [];

  await assert.rejects(
    writeLineageEvent(
      {
        async writeRequestEvent(request) {
          calls.push("request");

          return {
            id: "request-event-4",
            createdAt: "2026-04-01T00:00:05.000Z",
            ...request,
          };
        },
        async writeOptimizationAction(action) {
          calls.push("action");

          return {
            id: "action-2",
            createdAt: "2026-04-01T00:00:06.000Z",
            ...action,
          };
        },
      },
      {
        request: requestWrite,
        action: actionWrite,
        savings: savingsWrite,
      },
    ),
    {
      message: "LineageEventWriteAdapter.writeSavingsRecord is required for savings writes",
    },
  );

  assert.deepEqual(calls, ["request", "action"]);
});
