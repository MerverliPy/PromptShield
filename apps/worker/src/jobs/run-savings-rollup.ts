export type SavingsRollupInput = {
  requestEventId: string;
  grossCostUsd: number;
  optimizedCostUsd: number;
};

export type SavingsRollupTotals = {
  sourceRecordCount: number;
  grossCostUsd: number;
  optimizedCostUsd: number;
  realizedSavingsUsd: number;
};

export type SavingsRollupWriteResult =
  | {
      status: "written";
      rollupId: string;
    }
  | {
      status: "duplicate";
      rollupId: string;
    };

export interface SavingsRollupSource {
  listSavingsInputs(): Promise<readonly SavingsRollupInput[]>;
}

export interface SavingsRollupSink {
  writeSavingsRollup(input: SavingsRollupTotals): Promise<SavingsRollupWriteResult>;
}

export type SavingsRollupDependencies = {
  source: SavingsRollupSource;
  sink: SavingsRollupSink;
};

export type SavingsRollupJobResult = {
  job: "savings-rollup";
  persistence: SavingsRollupWriteResult;
  totals: SavingsRollupTotals;
};

export async function runSavingsRollup(
  dependencies: SavingsRollupDependencies,
): Promise<SavingsRollupJobResult> {
  const inputs = await dependencies.source.listSavingsInputs();
  const totals = buildSavingsRollupTotals(inputs);
  const persistence = await dependencies.sink.writeSavingsRollup(totals);

  return {
    job: "savings-rollup",
    persistence,
    totals,
  };
}

function buildSavingsRollupTotals(inputs: readonly SavingsRollupInput[]): SavingsRollupTotals {
  return inputs.reduce<SavingsRollupTotals>(
    (totals, input) => ({
      sourceRecordCount: totals.sourceRecordCount + 1,
      grossCostUsd: totals.grossCostUsd + input.grossCostUsd,
      optimizedCostUsd: totals.optimizedCostUsd + input.optimizedCostUsd,
      realizedSavingsUsd:
        totals.realizedSavingsUsd + (input.grossCostUsd - input.optimizedCostUsd),
    }),
    {
      sourceRecordCount: 0,
      grossCostUsd: 0,
      optimizedCostUsd: 0,
      realizedSavingsUsd: 0,
    },
  );
}
