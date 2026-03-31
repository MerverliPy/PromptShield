export type SavingsRecord = {
  requestId: string;
  workspaceId: string;
  grossCostUsd: number;
  optimizedCostUsd: number;
  realizedSavingsUsd: number;
  source: "compression" | "routing" | "combined";
  createdAt: string;
};
