import type { FastifyBaseLogger } from "fastify";
import type {
  LineageStore,
  LineageWrite,
} from "../../../../packages/db/src/lineage-writes";
import type { ProxyLineageEventPayload } from "./build-lineage-event";

type LineagePersistenceLogger = Pick<FastifyBaseLogger, "debug" | "warn">;

const noopLineageStore: LineageStore = {
  async writeLineage(input: LineageWrite) {
    return {
      request: {
        id: input.request.requestId,
        createdAt: new Date(0).toISOString(),
        ...input.request,
      },
      ...(input.action
        ? {
            action: {
              id: input.action.requestEventId,
              createdAt: new Date(0).toISOString(),
              ...input.action,
            },
          }
        : {}),
      ...(input.savings
        ? {
            savings: {
              id: input.savings.requestEventId,
              createdAt: new Date(0).toISOString(),
              ...input.savings,
            },
          }
        : {}),
    };
  },
};

export async function persistLineageEvent(input: {
  payload: ProxyLineageEventPayload;
  log: LineagePersistenceLogger;
  store?: LineageStore;
}): Promise<void> {
  const write = mapLineageEventToWrite(input.payload);

  try {
    await (input.store ?? noopLineageStore).writeLineage(write);
    input.log.debug({ lineageWrite: write }, "Proxy lineage write payload shell");
  } catch (error) {
    input.log.warn({ err: error, lineageWrite: write }, "Proxy lineage persistence failed");
  }
}

function mapLineageEventToWrite(payload: ProxyLineageEventPayload): LineageWrite {
  const workspaceId = getTagValue(payload.request.tags, "workspace") ?? "";

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
    ...(payload.action && payload.lineage.requestEventId
      ? {
          action: {
            requestEventId: payload.lineage.requestEventId,
            actionType: payload.action.actionType,
            beforeValue: payload.action.beforeValue,
            afterValue: payload.action.afterValue,
            reason: payload.action.reason,
          },
        }
      : {}),
  };
}

function getTagValue(tags: ProxyLineageEventPayload["request"]["tags"], key: string): string | null {
  return tags.find((tag) => tag.key === key)?.value ?? null;
}
