/// <reference types="node" />

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { getDashboardViewModel } from "./get-dashboard-view-model";
import { FALLBACK_DATA_INDICATOR } from "./mock-data";
import { createDashboardViewModel } from "./view-models";

test("getDashboardViewModel reads durable dashboard data when lineage tables are available", () => {
  try {
    execFileSync("sqlite3", ["--version"], { stdio: "ignore" });
  } catch {
    return;
  }

  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-dashboard-"));
  const databasePath = join(tempDirectory, "dashboard.sqlite");
  const previousDatabasePath = process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;

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

    process.env.PROMPTSHIELD_PROXY_LINEAGE_DB = databasePath;

    const dashboard = getDashboardViewModel();

    assert.equal(dashboard.dataIndicator, "Durable lineage summary");
    assert.deepEqual(dashboard.metrics, [
      {
        label: "Monthly spend",
        value: "$1.75",
        note: "Current billable usage",
      },
      {
        label: "Recovered margin",
        value: "$2.50",
        note: "Savings preserved this period",
      },
      {
        label: "Optimized requests",
        value: "1",
        note: "Requests with savings applied",
      },
      {
        label: "Recent outcomes",
        value: "1",
        note: "Recorded in the current summary",
      },
    ]);
    assert.deepEqual(dashboard.recentOutcomes, [
      {
        id: "request-1",
        summary: "chat.generate -> saved $2.50",
      },
    ]);
  } finally {
    if (previousDatabasePath === undefined) {
      delete process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;
    } else {
      process.env.PROMPTSHIELD_PROXY_LINEAGE_DB = previousDatabasePath;
    }

    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("getDashboardViewModel falls back to demo data when durable reads fail", () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-dashboard-fallback-"));
  const databasePath = join(tempDirectory, "missing.sqlite");
  const previousDatabasePath = process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;

  try {
    process.env.PROMPTSHIELD_PROXY_LINEAGE_DB = databasePath;

    const dashboard = getDashboardViewModel();

    assert.equal(dashboard.dataIndicator, FALLBACK_DATA_INDICATOR);
  } finally {
    if (previousDatabasePath === undefined) {
      delete process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;
    } else {
      process.env.PROMPTSHIELD_PROXY_LINEAGE_DB = previousDatabasePath;
    }

    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("getDashboardViewModel falls back to demo data when the lineage db env is unset", () => {
  const previousDatabasePath = process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;

  try {
    delete process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;

    const dashboard = getDashboardViewModel();

    assert.equal(dashboard.dataIndicator, FALLBACK_DATA_INDICATOR);
  } finally {
    if (previousDatabasePath === undefined) {
      delete process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;
    } else {
      process.env.PROMPTSHIELD_PROXY_LINEAGE_DB = previousDatabasePath;
    }
  }
});

test("createDashboardViewModel formats known and unknown metrics", () => {
  const dashboard = createDashboardViewModel(
    {
      metrics: [
        { id: "monthly_spend", value: 1234.5, unit: "usd" },
        { id: "recovered_margin", value: 2.5, unit: "usd" },
        { id: "optimized_requests", value: 7, unit: "count" },
        { id: "recent_outcomes", value: 3, unit: "count" },
        { id: "custom_metric", value: 99, unit: "count" },
      ],
      recentOutcomes: [],
    },
    { dataIndicator: "Test data" },
  );

  assert.deepEqual(dashboard.metrics, [
    {
      label: "Monthly spend",
      value: "$1,234.50",
      note: "Current billable usage",
    },
    {
      label: "Recovered margin",
      value: "$2.50",
      note: "Savings preserved this period",
    },
    {
      label: "Optimized requests",
      value: "7",
      note: "Requests with savings applied",
    },
    {
      label: "Recent outcomes",
      value: "3",
      note: "Recorded in the current summary",
    },
    {
      label: "custom_metric",
      value: "99",
      note: "Summary metric",
    },
  ]);
});

test("createDashboardViewModel formats recent outcome summaries across branches", () => {
  const dashboard = createDashboardViewModel(
    {
      metrics: [],
      recentOutcomes: [
        {
          id: "outcome-1",
          requestId: "chat.generate",
          decisionKind: "downgrade",
          modelRequested: "gpt-4.1",
          modelServed: "gpt-4.1-mini",
          realizedSavingsUsd: 2.5,
          createdAt: "2026-04-02T00:00:00.000Z",
        },
        {
          id: "outcome-2",
          requestId: "chat.reroute",
          decisionKind: "allow",
          modelRequested: "gpt-4.1",
          modelServed: "gpt-4.1-mini",
          realizedSavingsUsd: null,
          createdAt: "2026-04-02T00:00:01.000Z",
        },
        {
          id: "outcome-3",
          requestId: "chat.reject",
          decisionKind: "reject",
          modelRequested: "gpt-4.1",
          modelServed: "gpt-4.1",
          realizedSavingsUsd: null,
          createdAt: "2026-04-02T00:00:02.000Z",
        },
      ],
    },
    { dataIndicator: "Test data" },
  );

  assert.deepEqual(dashboard.recentOutcomes, [
    {
      id: "outcome-1",
      summary: "chat.generate -> saved $2.50",
    },
    {
      id: "outcome-2",
      summary: "chat.reroute -> rerouted to gpt-4.1-mini",
    },
    {
      id: "outcome-3",
      summary: "chat.reject -> rejected on gpt-4.1",
    },
  ]);
});
