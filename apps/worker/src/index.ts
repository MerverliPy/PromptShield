/// <reference types="node" />

import {
  runSavingsRollup,
  type SavingsRollupDependencies,
  type SavingsRollupJobResult,
} from "./jobs/run-savings-rollup";

const workerJobNames = ["savings-rollup"] as const;

export type WorkerJobName = (typeof workerJobNames)[number];

export type WorkerIdleState = {
  status: "idle";
  jobs: WorkerJobName[];
};

export type WorkerDependencies = {
  savingsRollup: SavingsRollupDependencies;
};

export type WorkerRunResult = SavingsRollupJobResult;

type WorkerJobRunner = (dependencies: WorkerDependencies) => Promise<WorkerRunResult>;

const defaultWorkerDependencies: WorkerDependencies = {
  savingsRollup: {
    source: {
      async listSavingsInputs() {
        return [];
      },
    },
    sink: {
      async writeSavingsRollup(input) {
        return {
          status: "written" as const,
          rollupId: `savings-rollup:${input.sourceRecordCount}`,
        };
      },
    },
  },
};

const workerRegistry: Record<WorkerJobName, WorkerJobRunner> = {
  "savings-rollup": (dependencies) => runSavingsRollup(dependencies.savingsRollup),
};

export function listWorkerJobs(): WorkerJobName[] {
  return [...workerJobNames];
}

export async function runWorkerJob(
  jobName: string,
  dependencies: WorkerDependencies = defaultWorkerDependencies,
): Promise<WorkerRunResult> {
  if (!isWorkerJobName(jobName)) {
    throw new Error(`Unsupported worker job: ${jobName}. Supported jobs: ${listWorkerJobs().join(", ")}`);
  }

  return workerRegistry[jobName](dependencies);
}

export async function startWorker(
  argv: readonly string[] = process.argv.slice(2),
  dependencies: WorkerDependencies = defaultWorkerDependencies,
): Promise<WorkerIdleState | WorkerRunResult> {
  const [jobName] = argv;

  if (!jobName) {
    return {
      status: "idle",
      jobs: listWorkerJobs(),
    };
  }

  return runWorkerJob(jobName, dependencies);
}

function isWorkerJobName(jobName: string): jobName is WorkerJobName {
  return workerJobNames.includes(jobName as WorkerJobName);
}

function isDirectExecution(): boolean {
  const entryPath = process.argv[1];

  if (!entryPath) {
    return false;
  }

  return import.meta.url === new URL(entryPath, "file:").href;
}

if (isDirectExecution()) {
  void startWorker()
    .then((result) => {
      console.log(result);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
