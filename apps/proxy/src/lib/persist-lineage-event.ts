import {
  writeProxyLineageEvent,
  type LineageEventWriteAdapter,
  type ProxyPersistedLineageWrite,
  type ProxyPersistedSavingsWrite,
} from "@promptshield/db";
import type { FastifyBaseLogger } from "fastify";
import type { ProxyLineageEventPayload } from "./build-lineage-event";

type LineagePersistenceLogger = Pick<FastifyBaseLogger, "debug" | "warn">;

export async function persistLineageEvent(input: {
  payload: ProxyLineageEventPayload;
  log: LineagePersistenceLogger;
  adapter?: LineageEventWriteAdapter;
}): Promise<void> {
  const write = mapLineageEventToWrite(input.payload);
  const adapter = input.adapter;

  if (!adapter) {
    input.log.debug({ lineageWrite: write }, "Proxy lineage persistence skipped: no db adapter configured");
    return;
  }

  try {
    const persisted = await writeProxyLineageEvent(adapter, write);

    input.log.debug({ lineageWrite: write }, "Proxy lineage write payload shell");
    input.log.debug({ lineageResult: persisted }, "Proxy lineage persisted through db seam");
  } catch (error) {
    input.log.warn({ err: error, lineageWrite: write }, "Proxy lineage persistence failed");
  }
}

function mapLineageEventToWrite(payload: ProxyLineageEventPayload): ProxyPersistedLineageWrite {
  const workspaceId = getTagValue(payload.request.tags, "workspace") ?? "";
  const savings = buildSavingsWrite(payload.action);

  return {
    request: {
      workspaceId,
      apiRouteId: null,
      requestId: payload.request.requestId,
      modelRequested: payload.request.modelRequested,
      modelServed: payload.request.modelServed,
      inputTokens: 0,
      outputTokens: null,
      estimatedCostUsd: payload.request.estimatedCostUsd,
      decisionKind: payload.request.decisionKind,
    },
    ...(payload.action
      ? {
          action: {
            actionType: payload.action.actionType,
            beforeValue: payload.action.beforeValue,
            afterValue: payload.action.afterValue,
            reason: payload.action.reason,
          },
        }
      : {}),
    ...(savings ? { savings } : {}),
  };
}

function getTagValue(tags: ProxyLineageEventPayload["request"]["tags"], key: string): string | null {
  return tags.find((tag) => tag.key === key)?.value ?? null;
}

function buildSavingsWrite(
  action: ProxyLineageEventPayload["action"],
): ProxyPersistedSavingsWrite | undefined {
  if (!action || action.actionType !== "model_reroute" || action.beforeValue <= action.afterValue) {
    return undefined;
  }

  return {
    grossCostUsd: action.beforeValue,
    optimizedCostUsd: action.afterValue,
    realizedSavingsUsd: Number((action.beforeValue - action.afterValue).toFixed(6)),
    source: "routing",
  };
}
