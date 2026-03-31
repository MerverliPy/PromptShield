import type { FastifyInstance } from "fastify";
import {
  normalizeOpenAIChatRequest,
  type OpenAIChatCompletionRequest,
} from "../lib/openai-normalize";

export function registerChatCompletionsRoute(app: FastifyInstance) {
  app.post<{ Body: OpenAIChatCompletionRequest }>(
    "/v1/chat/completions",
    async (request) => {
      const normalized = normalizeOpenAIChatRequest(request.body);

      return {
        status: "accepted",
        mode: "stub",
        normalized,
      };
    },
  );
}
