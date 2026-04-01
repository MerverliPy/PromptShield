import type { FastifyInstance } from "fastify";
import type { ProxyChatDecision } from "@promptshield/contracts/proxy";
import { evaluateRequest } from "@promptshield/policy/index";
import {
  normalizeOpenAIChatRequest,
  type OpenAIChatCompletionRequest,
} from "../lib/openai-normalize";

export function registerChatCompletionsRoute(app: FastifyInstance) {
  app.post<{ Body: OpenAIChatCompletionRequest; Reply: ProxyChatDecision }>(
    "/v1/chat/completions",
    async (request, reply) => {
      const normalized = normalizeOpenAIChatRequest(request.body);

      if (!normalized.ok) {
        reply.code(400);

        return {
          kind: "reject",
          reason: "invalid_request",
          issues: normalized.issues,
        };
      }

      return evaluateRequest(normalized.value);
    },
  );
}
