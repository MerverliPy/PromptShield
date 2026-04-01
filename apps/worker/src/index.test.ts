/// <reference types="node" />

import assert from "node:assert/strict";
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

test("runWorkerJob computes savings rollups for durable lineage inputs", async () => {
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
