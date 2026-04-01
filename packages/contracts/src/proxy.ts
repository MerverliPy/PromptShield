import type { Message } from "@promptshield/contracts/messages";

export type ProxyRequestPriority = "critical" | "standard" | "low";

export type ProxyChatRequestIssue = {
  field: string;
  reason: string;
};

export type ProxyChatRequest = {
  model: string;
  messages: Message[];
  controls: {
    temperature: number;
    maxTokens: number;
  };
  tags: Record<string, string>;
};

export type ProxyChatBudget = {
  estimatedCostUsd: number;
  requestCeilingUsd: number;
  overBudget: boolean;
};

export type ProxyChatDecision =
  | {
      kind: "allow";
      reason: string;
      requestedModel: string;
      targetModel: string;
      priority: ProxyRequestPriority;
      budget: ProxyChatBudget;
    }
  | {
      kind: "downgrade";
      reason: string;
      requestedModel: string;
      targetModel: string;
      priority: ProxyRequestPriority;
      budget: ProxyChatBudget;
    }
  | {
      kind: "reject";
      reason: string;
      requestedModel?: string;
      targetModel?: string;
      priority?: ProxyRequestPriority;
      budget?: ProxyChatBudget;
      issues?: ProxyChatRequestIssue[];
    };

export type ProxyDecision = ProxyChatDecision;
