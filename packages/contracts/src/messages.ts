export type MessageRole = "system" | "user" | "assistant" | "tool";

export type Message = {
  role: MessageRole;
  content: string;
};
