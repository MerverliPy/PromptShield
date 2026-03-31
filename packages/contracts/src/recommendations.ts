export type Recommendation = {
  workspaceId: string;
  kind: "routing" | "compression" | "policy";
  title: string;
  rationale: string;
  estimatedMonthlySavingsUsd: number;
};
