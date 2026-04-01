import type {
  LineageStore,
  LineageWrite,
  LineageWriteResult,
  OptimizationActionWrite,
  RequestEventWrite,
  SavingsRecordWrite,
} from "./lineage-writes";

export type ProxyPersistedActionWrite = Omit<OptimizationActionWrite, "requestEventId">;

export type ProxyPersistedSavingsWrite = Omit<
  SavingsRecordWrite,
  "requestEventId" | "optimizationActionId"
>;

export type ProxyPersistedLineageWrite = {
  request: RequestEventWrite;
  action?: ProxyPersistedActionWrite;
  savings?: ProxyPersistedSavingsWrite;
};

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

export async function writeProxyLineageEvent(
  adapter: LineageEventWriteAdapter,
  input: ProxyPersistedLineageWrite,
): Promise<LineageWriteResult> {
  const request = await writeLineageEvent(adapter, { request: input.request });
  const action = input.action
    ? await requireActionWriter(adapter).writeOptimizationAction({
        requestEventId: request.request.id,
        actionType: input.action.actionType,
        beforeValue: input.action.beforeValue,
        afterValue: input.action.afterValue,
        reason: input.action.reason,
      })
    : undefined;
  const savings = input.savings
    ? await requireSavingsWriter(adapter).writeSavingsRecord({
        requestEventId: request.request.id,
        optimizationActionId: requireActionResult(action).id,
        grossCostUsd: input.savings.grossCostUsd,
        optimizedCostUsd: input.savings.optimizedCostUsd,
        realizedSavingsUsd: input.savings.realizedSavingsUsd,
        source: input.savings.source,
      })
    : undefined;

  return {
    request: request.request,
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

function requireActionResult(
  action: LineageWriteResult["action"],
): NonNullable<LineageWriteResult["action"]> {
  if (!action) {
    throw new Error("A persisted optimization action is required for savings writes");
  }

  return action;
}
