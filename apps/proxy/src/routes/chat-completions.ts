import type { FastifyInstance, FastifyReply } from "fastify";
import type { LineageEventWriteAdapter } from "@promptshield/db";
import type { ProxyChatDecision } from "@promptshield/contracts/proxy";
import { evaluateRequest } from "@promptshield/policy/index";
import { buildLineageEventPayload } from "../lib/build-lineage-event";
import { emitLineageEvent } from "../lib/emit-lineage-event";
import { persistLineageEvent } from "../lib/persist-lineage-event";
import {
  normalizeOpenAIChatRequest,
  type OpenAIChatCompletionRequest,
} from "../lib/openai-normalize";

export const LINEAGE_PERSISTENCE_HEADER = "x-promptshield-lineage-persistence";
export const LINEAGE_PERSISTENCE_REASON_HEADER = "x-promptshield-lineage-persistence-reason";

export type LineagePersistenceState =
  | { status: "active" }
  | { status: "unavailable"; reason: "adapter_unconfigured" | "sqlite3_cli_unavailable" };

export function registerChatCompletionsRoute(
  app: FastifyInstance,
  options: {
    lineageAdapter?: LineageEventWriteAdapter;
    lineagePersistence?: LineagePersistenceState;
  } = {},
) {
  const lineagePersistence = options.lineagePersistence ?? deriveLineagePersistenceState(options.lineageAdapter);

  app.post<{ Body: OpenAIChatCompletionRequest; Reply: ProxyChatDecision }>(
    "/v1/chat/completions",
    async (request, reply) => {
      applyLineagePersistenceHeaders(reply, lineagePersistence);

      const normalized = normalizeOpenAIChatRequest(request.body);

      if (!normalized.ok) {
        reply.code(400);

        return {
          kind: "reject",
          reason: "invalid_request",
          issues: normalized.issues,
        };
      }

      const decision = evaluateRequest(normalized.value);
      const requestId = normalized.value.lineage?.requestId;
      const lineageEvent = buildLineageEventPayload({
        request: normalized.value,
        decision,
      });

      if (lineageEvent) {
        emitLineageEvent({ payload: lineageEvent, log: request.log });
        void persistLineageEvent({
          payload: lineageEvent,
          log: request.log,
          adapter: options.lineageAdapter,
        });
      }

      if (!requestId) {
        return decision;
      }

      return {
        ...decision,
        lineage: {
          ...decision.lineage,
          requestId,
        },
      };
    },
  );
}

function deriveLineagePersistenceState(
  lineageAdapter: LineageEventWriteAdapter | undefined,
): LineagePersistenceState {
  return lineageAdapter
    ? { status: "active" }
    : { status: "unavailable", reason: "adapter_unconfigured" };
}

function applyLineagePersistenceHeaders(reply: FastifyReply, lineagePersistence: LineagePersistenceState) {
  reply.header(LINEAGE_PERSISTENCE_HEADER, lineagePersistence.status);

  if (lineagePersistence.status === "unavailable") {
    reply.header(LINEAGE_PERSISTENCE_REASON_HEADER, lineagePersistence.reason);
  }
}
