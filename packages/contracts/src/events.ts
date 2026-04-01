import type {
  ApiRoute,
  DecisionKind,
  OptimizationAction,
  RequestEvent,
  SavingsRecord,
  Workspace,
} from "@promptshield/contracts/durable";

export type {
  ApiRoute,
  DecisionKind,
  OptimizationAction,
  RequestEvent,
  SavingsRecord,
  Workspace,
} from "@promptshield/contracts/durable";

export type OptimizationActionEvent = OptimizationAction;
export type RequestEventRecord = RequestEvent;
export type SavingsRecordEvent = SavingsRecord;

export type RequestActionLineageEvent = {
  request: RequestEvent;
  action: OptimizationAction;
};

export type RequestActionSavingsLineageEvent = RequestActionLineageEvent & {
  savings: SavingsRecord;
};
