import type { Message } from "@promptshield/contracts/messages";
import type { ProxyChatRequest } from "@promptshield/contracts/proxy";

export type OpenAIChatCompletionRequest = {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  metadata?: Record<string, string>;
};

export function normalizeOpenAIChatRequest(
  request: OpenAIChatCompletionRequest,
): ProxyChatRequest {
  return {
    model: request.model,
    messages: request.messages,
    controls: {
      temperature: request.temperature ?? 0.7,
      maxTokens: request.max_tokens,
    },
    tags: request.metadata ?? {},
  };
}
