import type {
  LineageStore,
  LineageWrite,
  LineageWriteResult,
  OptimizationActionWrite,
  RequestEventWrite,
  SavingsRecordWrite,
} from "./lineage-writes";

export interface LineageEventWriteAdapter {
  writeRequestEvent(request: RequestEventWrite): Promise<LineageWriteResult["request"]>;
  writeOptimizationAction?(
    action: OptimizationActionWrite,
  ): Promise<NonNullable<LineageWriteResult["action"]>>;
  writeSavingsRecord?(
    savings: SavingsRecordWrite,
  ): Promise<NonNullable<LineageWriteResult["savings"]>>;
}

export async function writeLineageEvent(
  adapter: LineageEventWriteAdapter,
  input: LineageWrite,
): Promise<LineageWriteResult> {
  const request = await adapter.writeRequestEvent(input.request);
  const action = input.action
    ? await requireActionWriter(adapter).writeOptimizationAction(input.action)
    : undefined;
  const savings = input.savings
    ? await requireSavingsWriter(adapter).writeSavingsRecord(input.savings)
    : undefined;

  return {
    request,
    ...(action ? { action } : {}),
    ...(savings ? { savings } : {}),
  };
}

export function createLineageEventStore(adapter: LineageEventWriteAdapter): LineageStore {
  return {
    async writeLineage(input) {
      return writeLineageEvent(adapter, input);
    },
  };
}

function requireActionWriter(
  adapter: LineageEventWriteAdapter,
): Required<Pick<LineageEventWriteAdapter, "writeOptimizationAction">> {
  if (!adapter.writeOptimizationAction) {
    throw new Error("LineageEventWriteAdapter.writeOptimizationAction is required for action writes");
  }

  return { writeOptimizationAction: adapter.writeOptimizationAction };
}

function requireSavingsWriter(
  adapter: LineageEventWriteAdapter,
): Required<Pick<LineageEventWriteAdapter, "writeSavingsRecord">> {
  if (!adapter.writeSavingsRecord) {
    throw new Error("LineageEventWriteAdapter.writeSavingsRecord is required for savings writes");
  }

  return { writeSavingsRecord: adapter.writeSavingsRecord };
}
