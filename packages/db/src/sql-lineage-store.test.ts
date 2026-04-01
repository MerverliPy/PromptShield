/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";

import type { LineageWrite } from "./lineage-writes";
import {
  createSqlLineageEventAdapter,
  createSqlLineageStore,
} from "./sql-lineage-store";

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
  requestEventId: "request-1",
  actionType: "model_reroute",
  beforeValue: 0.14,
  afterValue: 0.08,
  reason: "Matched cheaper safe model",
};

const savingsWrite: NonNullable<LineageWrite["savings"]> = {
  requestEventId: "request-1",
  optimizationActionId: "action-1",
  grossCostUsd: 0.14,
  optimizedCostUsd: 0.08,
  realizedSavingsUsd: 0.06,
  source: "routing",
};

test("createSqlLineageEventAdapter writes schema and lineage inserts through the executor", async () => {
  const statements: string[] = [];
  const adapter = createSqlLineageEventAdapter(
    {
      async execute(statement) {
        statements.push(statement);
      },
    },
    {
      createId(kind) {
        return `${kind}-id`;
      },
      now() {
        return "2026-04-01T00:00:00.000Z";
      },
    },
  );

  const request = await adapter.writeRequestEvent(requestWrite);
  const action = await adapter.writeOptimizationAction?.(actionWrite);
  const savings = await adapter.writeSavingsRecord?.(savingsWrite);

  assert.deepEqual(request, {
    id: "request-id",
    createdAt: "2026-04-01T00:00:00.000Z",
    ...requestWrite,
  });
  assert.deepEqual(action, {
    id: "action-id",
    createdAt: "2026-04-01T00:00:00.000Z",
    ...actionWrite,
  });
  assert.deepEqual(savings, {
    id: "savings-id",
    createdAt: "2026-04-01T00:00:00.000Z",
    ...savingsWrite,
  });
  assert.equal(statements.length, 4);
  assert.match(statements[0] ?? "", /CREATE TABLE IF NOT EXISTS request_events/);
  assert.match(statements[1] ?? "", /INSERT INTO request_events/);
  assert.match(statements[2] ?? "", /INSERT INTO optimization_actions/);
  assert.match(statements[3] ?? "", /INSERT INTO savings_records/);
});

test("createSqlLineageStore reuses the lineage seam for request-only writes", async () => {
  const statements: string[] = [];
  const store = createSqlLineageStore(
    {
      async execute(statement) {
        statements.push(statement);
      },
    },
    {
      createId(kind) {
        return `${kind}-id`;
      },
      now() {
        return "2026-04-01T00:00:01.000Z";
      },
    },
  );

  const result = await store.writeLineage({ request: requestWrite });

  assert.deepEqual(result, {
    request: {
      id: "request-id",
      createdAt: "2026-04-01T00:00:01.000Z",
      ...requestWrite,
    },
  });
  assert.equal(statements.length, 2);
  assert.match(statements[0] ?? "", /CREATE TABLE IF NOT EXISTS request_events/);
  assert.match(statements[1] ?? "", /INSERT INTO request_events/);
});
