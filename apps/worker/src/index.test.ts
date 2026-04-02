/// <reference types="node" />

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { WorkerDependencies } from "./index";
import { listWorkerJobs, runWorkerJob, startWorker } from "./index";

test("listWorkerJobs returns the supported jobs in deterministic order", () => {
  assert.deepEqual(listWorkerJobs(), ["savings-rollup"]);
});

test("startWorker returns idle state when no job is requested", async () => {
  assert.deepEqual(await startWorker([]), {
    status: "idle",
    jobs: ["savings-rollup"],
  });
});

test("runWorkerJob uses injected dependencies even when durable env wiring is present", async () => {
  const dependencies: WorkerDependencies = {
    savingsRollup: {
      source: {
        async listSavingsInputs() {
          return [
            { requestEventId: "req_1", grossCostUsd: 10, optimizedCostUsd: 6 },
            { requestEventId: "req_2", grossCostUsd: 4.5, optimizedCostUsd: 3 },
          ] as const;
        },
      },
      sink: {
        async writeSavingsRollup(input) {
          assert.deepEqual(input, {
            sourceRecordCount: 2,
            grossCostUsd: 14.5,
            optimizedCostUsd: 9,
            realizedSavingsUsd: 5.5,
          });

          return {
            status: "written" as const,
            rollupId: "rollup_1",
          };
        },
      },
    },
  };

  await withEnvValue("PROMPTSHIELD_PROXY_LINEAGE_DB", "/tmp/not-used.sqlite", async () => {
    assert.deepEqual(await runWorkerJob("savings-rollup", dependencies), {
      job: "savings-rollup",
      persistence: {
        status: "written",
        rollupId: "rollup_1",
      },
      totals: {
        sourceRecordCount: 2,
        grossCostUsd: 14.5,
        optimizedCostUsd: 9,
        realizedSavingsUsd: 5.5,
      },
    });
  });
});

test("runWorkerJob surfaces duplicate rollups explicitly for idempotency", async () => {
  const dependencies: WorkerDependencies = {
    savingsRollup: {
      source: {
        async listSavingsInputs() {
          return [{ requestEventId: "req_1", grossCostUsd: 8, optimizedCostUsd: 5 }] as const;
        },
      },
      sink: {
        async writeSavingsRollup(input) {
          assert.deepEqual(input, {
            sourceRecordCount: 1,
            grossCostUsd: 8,
            optimizedCostUsd: 5,
            realizedSavingsUsd: 3,
          });

          return {
            status: "duplicate" as const,
            rollupId: "rollup_existing",
          };
        },
      },
    },
  };

  assert.deepEqual(await runWorkerJob("savings-rollup", dependencies), {
    job: "savings-rollup",
    persistence: {
      status: "duplicate",
      rollupId: "rollup_existing",
    },
    totals: {
      sourceRecordCount: 1,
      grossCostUsd: 8,
      optimizedCostUsd: 5,
      realizedSavingsUsd: 3,
    },
  });
});

test("runWorkerJob fails clearly for an unsupported job", async () => {
  await assert.rejects(
    () => runWorkerJob("unknown"),
    new Error("Unsupported worker job: unknown. Supported jobs: savings-rollup"),
  );
});

test("runWorkerJob uses durable sqlite lineage inputs when PROMPTSHIELD_PROXY_LINEAGE_DB is set", async () => {
  try {
    execFileSync("sqlite3", ["--version"], { stdio: "ignore" });
  } catch {
    return;
  }

  const tempDirectory = mkdtempSync(join(tmpdir(), "promptshield-worker-rollup-"));
  const databasePath = join(tempDirectory, "lineage.sqlite");

  try {
    execFileSync(
      "sqlite3",
      [
        databasePath,
        [
          "CREATE TABLE savings_records (id TEXT PRIMARY KEY, request_event_id TEXT NOT NULL, optimization_action_id TEXT NOT NULL, gross_cost_usd REAL NOT NULL, optimized_cost_usd REAL NOT NULL, realized_savings_usd REAL NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL)",
          "INSERT INTO savings_records VALUES ('savings-2', 'request-2', 'action-2', 3.5, 1.5, 2.0, 'routing', '2026-04-02T00:00:00.000Z')",
          "INSERT INTO savings_records VALUES ('savings-1', 'request-1', 'action-1', 4.25, 1.75, 2.5, 'routing', '2026-04-02T00:00:00.000Z')",
        ].join("; "),
      ],
      { stdio: "ignore" },
    );

    await withEnvValue("PROMPTSHIELD_PROXY_LINEAGE_DB", databasePath, async () => {
      assert.deepEqual(await runWorkerJob("savings-rollup"), {
        job: "savings-rollup",
        persistence: {
          status: "written",
          rollupId: "savings-rollup:2",
        },
        totals: {
          sourceRecordCount: 2,
          grossCostUsd: 7.75,
          optimizedCostUsd: 3.25,
          realizedSavingsUsd: 4.5,
        },
      });
    });
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("runWorkerJob falls back to the empty source when PROMPTSHIELD_PROXY_LINEAGE_DB is unset", async () => {
  await withEnvValue("PROMPTSHIELD_PROXY_LINEAGE_DB", undefined, async () => {
    assert.deepEqual(await runWorkerJob("savings-rollup"), {
      job: "savings-rollup",
      persistence: {
        status: "written",
        rollupId: "savings-rollup:0",
      },
      totals: {
        sourceRecordCount: 0,
        grossCostUsd: 0,
        optimizedCostUsd: 0,
        realizedSavingsUsd: 0,
      },
    });
  });
});

async function withEnvValue(
  name: string,
  value: string | undefined,
  callback: () => Promise<void>,
): Promise<void> {
  const previousValue = process.env[name];

  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }

  try {
    await callback();
  } finally {
    if (previousValue === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previousValue;
    }
  }
}
