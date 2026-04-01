import type {
  OptimizationActionEvent,
  RequestEventRecord,
  SavingsRecordEvent,
} from "@promptshield/contracts/events";

export type RequestEventWrite = Omit<RequestEventRecord, "id" | "createdAt">;

export type OptimizationActionWrite = Omit<OptimizationActionEvent, "id" | "createdAt">;

export type SavingsRecordWrite = Omit<SavingsRecordEvent, "id" | "createdAt">;

export type LineageWrite = {
  request: RequestEventWrite;
  action?: OptimizationActionWrite;
  savings?: SavingsRecordWrite;
};

export type LineageWriteResult = {
  request: RequestEventRecord;
  action?: OptimizationActionEvent;
  savings?: SavingsRecordEvent;
};

export interface LineageStore {
  writeLineage(input: LineageWrite): Promise<LineageWriteResult>;
}
