import type { Message } from "@promptshield/contracts/messages";

export type ProxyChatRequest = {
  model: string;
  messages: Message[];
  controls: {
    temperature: number;
    maxTokens?: number;
  };
  tags: Record<string, string>;
};

export type ProxyDecision =
  | { kind: "pass_through"; reason: string }
  | { kind: "reroute"; reason: string; targetModel: string }
  | { kind: "compress"; reason: string }
  | { kind: "reject"; reason: string };
