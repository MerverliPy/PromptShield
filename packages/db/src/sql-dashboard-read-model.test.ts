/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSqlDashboardReadModel,
  createSqliteCliDashboardReadModel,
} from "./sql-dashboard-read-model";

test("createSqlDashboardReadModel builds dashboard summaries from durable lineage rows", () => {
  const statements: string[] = [];
  const readModel = createSqlDashboardReadModel(
    {
      query(statement) {
        statements.push(statement);

        if (statement.includes("AS monthly_spend")) {
          return [
            {
              monthly_spend: 18.75,
              recovered_margin: 6.25,
              optimized_requests: 2,
            },
          ];
        }

        return [
          {
            id: "request-3",
            request_id: "support.summarize",
            decision_kind: "downgrade",
            model_requested: "gpt-4.1",
            model_served: "gpt-4.1-mini",
            realized_savings_usd: 4.5,
            created_at: "2026-04-08T00:03:00.000Z",
          },
          {
            id: "request-2",
            request_id: "agent.plan",
            decision_kind: "allow",
            model_requested: "gpt-4.1",
            model_served: "gpt-4.1",
            realized_savings_usd: null,
            created_at: "2026-04-08T00:02:00.000Z",
          },
          {
            id: "request-1",
            request_id: "chat.generate",
            decision_kind: "reject",
            model_requested: "gpt-4.1",
            model_served: "gpt-4.1",
            realized_savings_usd: null,
            created_at: "2026-04-08T00:01:00.000Z",
          },
        ];
      },
    },
    {
      now() {
        return "2026-04-15T12:00:00.000Z";
      },
    },
  );

  const summary = readModel.readDashboardSummary({ recentOutcomeLimit: 3 });

  assert.deepEqual(summary, {
    metrics: [
      { id: "monthly_spend", value: 18.75, unit: "usd" },
      { id: "recovered_margin", value: 6.25, unit: "usd" },
      { id: "optimized_requests", value: 2, unit: "count" },
      { id: "recent_outcomes", value: 3, unit: "count" },
    ],
    recentOutcomes: [
      {
        id: "request-3",
        requestId: "support.summarize",
        decisionKind: "downgrade",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1-mini",
        realizedSavingsUsd: 4.5,
        createdAt: "2026-04-08T00:03:00.000Z",
      },
      {
        id: "request-2",
        requestId: "agent.plan",
        decisionKind: "allow",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1",
        realizedSavingsUsd: null,
        createdAt: "2026-04-08T00:02:00.000Z",
      },
      {
        id: "request-1",
        requestId: "chat.generate",
        decisionKind: "reject",
        modelRequested: "gpt-4.1",
        modelServed: "gpt-4.1",
        realizedSavingsUsd: null,
        createdAt: "2026-04-08T00:01:00.000Z",
      },
    ],
  });
  assert.equal(statements.length, 2);
  assert.match(statements[0] ?? "", /FROM request_events r/);
  assert.match(statements[0] ?? "", /2026-04-01T00:00:00.000Z/);
  assert.match(statements[0] ?? "", /2026-05-01T00:00:00.000Z/);
  assert.match(statements[1] ?? "", /ORDER BY r.created_at DESC, r.id DESC LIMIT 3/);
});

test("createSqlDashboardReadModel preserves zero metrics and can skip recent outcomes queries", () => {
  const statements: string[] = [];
  const readModel = createSqlDashboardReadModel({
    query(statement) {
      statements.push(statement);

      return [
        {
          monthly_spend: null,
          recovered_margin: null,
          optimized_requests: null,
        },
      ];
    },
  });

  const summary = readModel.readDashboardSummary({ recentOutcomeLimit: 0 });

  assert.deepEqual(summary, {
    metrics: [
      { id: "monthly_spend", value: 0, unit: "usd" },
      { id: "recovered_margin", value: 0, unit: "usd" },
      { id: "optimized_requests", value: 0, unit: "count" },
      { id: "recent_outcomes", value: 0, unit: "count" },
    ],
    recentOutcomes: [],
  });
  assert.equal(statements.length, 1);
  assert.match(statements[0] ?? "", /AS monthly_spend/);
});

test("createSqlDashboardReadModel derives recent_outcomes from the returned summary rows", () => {
  const readModel = createSqlDashboardReadModel({
    query(statement) {
      if (statement.includes("AS monthly_spend")) {
        return [
          {
            monthly_spend: 18.75,
            recovered_margin: 6.25,
            optimized_requests: 2,
          },
        ];
      }

      return [
        {
          id: "request-3",
          request_id: "support.summarize",
          decision_kind: "downgrade",
          model_requested: "gpt-4.1",
          model_served: "gpt-4.1-mini",
          realized_savings_usd: 4.5,
          created_at: "2026-04-08T00:03:00.000Z",
        },
      ];
    },
  });

  const summary = readModel.readDashboardSummary({ recentOutcomeLimit: 1 });

  assert.equal(summary.metrics.find((metric) => metric.id === "recent_outcomes")?.value, 1);
});

test("createSqliteCliDashboardReadModel reads dashboard summaries from a sqlite database", () => {
  try {
    execFileSync("sqlite3", ["--version"], { stdio: "ignore" });
  } catch {
    return;
  }

  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-db-dashboard-"));
  const databasePath = join(tempDirectory, "dashboard.sqlite");

  try {
    execFileSync(
      "sqlite3",
      [
        databasePath,
        [
          "CREATE TABLE request_events (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, api_route_id TEXT, request_id TEXT NOT NULL, model_requested TEXT NOT NULL, model_served TEXT NOT NULL, input_tokens INTEGER NOT NULL, output_tokens INTEGER, estimated_cost_usd REAL NOT NULL, decision_kind TEXT NOT NULL, created_at TEXT NOT NULL)",
          "CREATE TABLE savings_records (id TEXT PRIMARY KEY, request_event_id TEXT NOT NULL, optimization_action_id TEXT NOT NULL, gross_cost_usd REAL NOT NULL, optimized_cost_usd REAL NOT NULL, realized_savings_usd REAL NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL)",
          "INSERT INTO request_events VALUES ('request-1', 'workspace-1', NULL, 'chat.generate', 'gpt-4.1', 'gpt-4.1-mini', 10, 5, 4.25, 'downgrade', '2026-04-02T00:00:00.000Z')",
          "INSERT INTO savings_records VALUES ('savings-1', 'request-1', 'action-1', 4.25, 1.75, 2.5, 'routing', '2026-04-02T00:00:01.000Z')",
        ].join("; "),
      ],
      { stdio: "ignore" },
    );

    const summary = createSqliteCliDashboardReadModel(databasePath, {
      now() {
        return "2026-04-15T12:00:00.000Z";
      },
    }).readDashboardSummary({ recentOutcomeLimit: 3 });

    assert.deepEqual(summary, {
      metrics: [
        { id: "monthly_spend", value: 1.75, unit: "usd" },
        { id: "recovered_margin", value: 2.5, unit: "usd" },
        { id: "optimized_requests", value: 1, unit: "count" },
        { id: "recent_outcomes", value: 1, unit: "count" },
      ],
      recentOutcomes: [
        {
          id: "request-1",
          requestId: "chat.generate",
          decisionKind: "downgrade",
          modelRequested: "gpt-4.1",
          modelServed: "gpt-4.1-mini",
          realizedSavingsUsd: 2.5,
          createdAt: "2026-04-02T00:00:00.000Z",
        },
      ],
    });
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
