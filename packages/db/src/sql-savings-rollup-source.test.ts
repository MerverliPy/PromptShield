/// <reference types="node" />

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  createSqlSavingsRollupSource,
  createSqliteCliSavingsRollupSource,
} from "./sql-savings-rollup-source";

test("createSqlSavingsRollupSource returns an empty array for empty durable lineage data", () => {
  const statements: string[] = [];
  const source = createSqlSavingsRollupSource({
    query(statement) {
      statements.push(statement);
      return [];
    },
  });

  assert.deepEqual(source.readSavingsRollupInputs(), []);
  assert.equal(statements.length, 1);
  assert.match(statements[0] ?? "", /FROM savings_records/);
  assert.match(statements[0] ?? "", /ORDER BY created_at ASC, id ASC/);
});

test("createSqlSavingsRollupSource maps a saved lineage row into rollup input shape", () => {
  const source = createSqlSavingsRollupSource({
    query() {
      return [
        {
          request_event_id: "request-1",
          gross_cost_usd: 4.25,
          optimized_cost_usd: 1.75,
        },
      ];
    },
  });

  assert.deepEqual(source.readSavingsRollupInputs(), [
    {
      requestEventId: "request-1",
      grossCostUsd: 4.25,
      optimizedCostUsd: 1.75,
    },
  ]);
});

test("createSqliteCliSavingsRollupSource reads multiple saved lineage rows in deterministic order", () => {
  try {
    execFileSync("sqlite3", ["--version"], { stdio: "ignore" });
  } catch {
    return;
  }

  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-db-rollup-"));
  const databasePath = join(tempDirectory, "rollup.sqlite");

  try {
    execFileSync(
      "sqlite3",
      [
        databasePath,
        [
          "CREATE TABLE savings_records (id TEXT PRIMARY KEY, request_event_id TEXT NOT NULL, optimization_action_id TEXT NOT NULL, gross_cost_usd REAL NOT NULL, optimized_cost_usd REAL NOT NULL, realized_savings_usd REAL NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL)",
          "INSERT INTO savings_records VALUES ('savings-2', 'request-2', 'action-2', 3.5, 1.5, 2.0, 'routing', '2026-04-02T00:00:00.000Z')",
          "INSERT INTO savings_records VALUES ('savings-1', 'request-1', 'action-1', 4.25, 1.75, 2.5, 'routing', '2026-04-02T00:00:00.000Z')",
          "INSERT INTO savings_records VALUES ('savings-3', 'request-3', 'action-3', 7.0, 2.5, 4.5, 'routing', '2026-04-02T00:00:01.000Z')",
        ].join("; "),
      ],
      { stdio: "ignore" },
    );

    assert.deepEqual(createSqliteCliSavingsRollupSource(databasePath).readSavingsRollupInputs(), [
      {
        requestEventId: "request-1",
        grossCostUsd: 4.25,
        optimizedCostUsd: 1.75,
      },
      {
        requestEventId: "request-2",
        grossCostUsd: 3.5,
        optimizedCostUsd: 1.5,
      },
      {
        requestEventId: "request-3",
        grossCostUsd: 7,
        optimizedCostUsd: 2.5,
      },
    ]);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
