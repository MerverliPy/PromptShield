import { createHash } from "node:crypto";
import type { Message } from "@promptshield/contracts/messages";
import type {
  ProxyChatRequest,
  ProxyChatRequestIssue,
} from "@promptshield/contracts/proxy";

export type OpenAIChatCompletionRequest = {
  model?: unknown;
  messages?: unknown;
  temperature?: unknown;
  max_tokens?: unknown;
  metadata?: unknown;
};

export type NormalizeOpenAIChatRequestResult =
  | { ok: true; value: ProxyChatRequest }
  | { ok: false; issues: ProxyChatRequestIssue[] };

export function normalizeOpenAIChatRequest(
  request: OpenAIChatCompletionRequest,
): NormalizeOpenAIChatRequestResult {
  const issues: ProxyChatRequestIssue[] = [];
  const model =
    typeof request.model === "string" && request.model.trim().length > 0
      ? request.model.trim()
      : undefined;

  if (!model) {
    issues.push({ field: "model", reason: "model must be a non-empty string" });
  }

  const messages = normalizeMessages(request.messages, issues);
  const temperature = normalizeTemperature(request.temperature, issues);
  const maxTokens = normalizeMaxTokens(request.max_tokens, issues);
  const tags = normalizeMetadata(request.metadata, issues);

  if (issues.length > 0 || !model || !messages || temperature === undefined || maxTokens === undefined || !tags) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      model,
      messages,
      controls: {
        temperature,
        maxTokens,
      },
      tags,
      lineage: {
        requestId: buildDeterministicRequestId({
          model,
          messages,
          temperature,
          maxTokens,
          tags,
        }),
      },
    },
  };
}

function buildDeterministicRequestId(input: {
  model: string;
  messages: Message[];
  temperature: number;
  maxTokens: number;
  tags: Record<string, string>;
}): string {
  const payload = JSON.stringify({
    model: input.model,
    messages: input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    controls: {
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    },
    tags: Object.keys(input.tags)
      .sort()
      .map((key) => [key, input.tags[key]]),
  });

  return `req_${createHash("sha256").update(payload).digest("hex").slice(0, 32)}`;
}

function normalizeMessages(
  value: unknown,
  issues: ProxyChatRequestIssue[],
): Message[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({ field: "messages", reason: "messages must be a non-empty array" });
    return undefined;
  }

  const messages: Message[] = [];

  for (const [index, item] of value.entries()) {
    if (!isMessage(item)) {
      issues.push({
        field: `messages[${index}]`,
        reason: "each message must include a valid role and string content",
      });
      continue;
    }

    messages.push(item);
  }

  return issues.some((issue) => issue.field.startsWith("messages[")) ? undefined : messages;
}

function normalizeTemperature(
  value: unknown,
  issues: ProxyChatRequestIssue[],
): number | undefined {
  if (value === undefined) {
    return 0.7;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 2) {
    issues.push({
      field: "temperature",
      reason: "temperature must be a finite number between 0 and 2",
    });
    return undefined;
  }

  return value;
}

function normalizeMaxTokens(
  value: unknown,
  issues: ProxyChatRequestIssue[],
): number | undefined {
  if (value === undefined) {
    return 256;
  }

  if (!Number.isInteger(value) || (value as number) <= 0) {
    issues.push({ field: "max_tokens", reason: "max_tokens must be a positive integer" });
    return undefined;
  }

  return value as number;
}

function normalizeMetadata(
  value: unknown,
  issues: ProxyChatRequestIssue[],
): Record<string, string> | undefined {
  if (value === undefined) {
    return {};
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issues.push({ field: "metadata", reason: "metadata must be an object of string values" });
    return undefined;
  }

  const tags: Record<string, string> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue !== "string") {
      issues.push({
        field: `metadata.${key}`,
        reason: "metadata values must be strings",
      });
      continue;
    }

    tags[key] = entryValue;
  }

  return issues.some((issue) => issue.field.startsWith("metadata.")) ? undefined : tags;
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    (message.role === "system" ||
      message.role === "user" ||
      message.role === "assistant" ||
      message.role === "tool") &&
    typeof message.content === "string"
  );
}
