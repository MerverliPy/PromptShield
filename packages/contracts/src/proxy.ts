import type { Message } from "@promptshield/contracts/messages";
import type {
  OptimizationActionEvent,
  RequestEventRecord,
  SavingsRecordEvent,
} from "@promptshield/contracts/events";

export type ProxyRequestPriority = "critical" | "standard" | "low";

export type ProxyChatRequestIssue = {
  field: string;
  reason: string;
};

export type ProxyRequestLineage = {
  requestId: RequestEventRecord["requestId"];
  requestEventId?: RequestEventRecord["id"];
};

export type ProxyDecisionLineage = ProxyRequestLineage & {
  actionId?: OptimizationActionEvent["id"];
  savingsRecordId?: SavingsRecordEvent["id"];
};

export type ProxyChatRequest = {
  model: string;
  messages: Message[];
  controls: {
    temperature: number;
    maxTokens: number;
  };
  tags: Record<string, string>;
  lineage?: ProxyRequestLineage;
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
      lineage?: ProxyDecisionLineage;
    }
  | {
      kind: "downgrade";
      reason: string;
      requestedModel: string;
      targetModel: string;
      priority: ProxyRequestPriority;
      budget: ProxyChatBudget;
      lineage?: ProxyDecisionLineage;
    }
  | {
      kind: "reject";
      reason: string;
      requestedModel?: string;
      targetModel?: string;
      priority?: ProxyRequestPriority;
      budget?: ProxyChatBudget;
      issues?: ProxyChatRequestIssue[];
      lineage?: ProxyDecisionLineage;
    };

export type ProxyDecision = ProxyChatDecision;
