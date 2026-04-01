export type {
  ApiRoute,
  DecisionKind,
  OptimizationAction,
  RequestEvent,
  SavingsRecord,
  Workspace,
} from "@promptshield/contracts/durable";

export type OptimizationActionEvent = import("@promptshield/contracts/durable").OptimizationAction;
export type RequestEventRecord = import("@promptshield/contracts/durable").RequestEvent;
export type SavingsRecordEvent = import("@promptshield/contracts/durable").SavingsRecord & {
  optimizationActionId: OptimizationActionEvent["id"];
};

export type RequestActionLineageEvent = {
  request: RequestEventRecord;
  action: OptimizationActionEvent;
};

export type RequestActionSavingsLineageEvent = RequestActionLineageEvent & {
  savings: SavingsRecordEvent;
};
