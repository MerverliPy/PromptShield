import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

import type {
  LineageStore,
  LineageWriteResult,
  RequestEventWrite,
} from "./lineage-writes";
import {
  createLineageEventStore,
  type LineageEventWriteAdapter,
} from "./write-lineage-event";

const execFileAsync = promisify(execFile);

const CREATE_SCHEMA_SQL = [
  "PRAGMA foreign_keys = ON",
  "CREATE TABLE IF NOT EXISTS request_events (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, api_route_id TEXT, request_id TEXT NOT NULL, model_requested TEXT NOT NULL, model_served TEXT NOT NULL, input_tokens INTEGER NOT NULL, output_tokens INTEGER, estimated_cost_usd REAL NOT NULL, decision_kind TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS optimization_actions (id TEXT PRIMARY KEY, request_event_id TEXT NOT NULL REFERENCES request_events(id), action_type TEXT NOT NULL, before_value REAL NOT NULL, after_value REAL NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS savings_records (id TEXT PRIMARY KEY, request_event_id TEXT NOT NULL REFERENCES request_events(id), optimization_action_id TEXT NOT NULL REFERENCES optimization_actions(id), gross_cost_usd REAL NOT NULL, optimized_cost_usd REAL NOT NULL, realized_savings_usd REAL NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL)",
].join(";\n");

export interface SqlLineageStatementExecutor {
  execute(statement: string): Promise<void>;
}

export type SqlLineageIdFactory = (kind: "request" | "action" | "savings") => string;

export type SqlLineageAdapterOptions = {
  createId?: SqlLineageIdFactory;
  now?: () => string;
};

export function createSqlLineageEventAdapter(
  executor: SqlLineageStatementExecutor,
  options: SqlLineageAdapterOptions = {},
): LineageEventWriteAdapter {
  const createId = options.createId ?? defaultCreateId;
  const now = options.now ?? (() => new Date().toISOString());
  let schemaPromise: Promise<void> | undefined;

  function ensureSchema() {
    schemaPromise ??= executor.execute(CREATE_SCHEMA_SQL);
    return schemaPromise;
  }

  return {
    async writeRequestEvent(request) {
      await ensureSchema();

      const record: LineageWriteResult["request"] = {
        id: createId("request"),
        createdAt: now(),
        ...request,
      };

      await executor.execute(buildInsertStatement("request_events", {
        id: record.id,
        workspace_id: record.workspaceId,
        api_route_id: record.apiRouteId,
        request_id: record.requestId,
        model_requested: record.modelRequested,
        model_served: record.modelServed,
        input_tokens: record.inputTokens,
        output_tokens: record.outputTokens,
        estimated_cost_usd: record.estimatedCostUsd,
        decision_kind: record.decisionKind,
        created_at: record.createdAt,
      }));

      return record;
    },
    async writeOptimizationAction(action) {
      await ensureSchema();

      const record: NonNullable<LineageWriteResult["action"]> = {
        id: createId("action"),
        createdAt: now(),
        ...action,
      };

      await executor.execute(buildInsertStatement("optimization_actions", {
        id: record.id,
        request_event_id: record.requestEventId,
        action_type: record.actionType,
        before_value: record.beforeValue,
        after_value: record.afterValue,
        reason: record.reason,
        created_at: record.createdAt,
      }));

      return record;
    },
    async writeSavingsRecord(savings) {
      await ensureSchema();

      const record: NonNullable<LineageWriteResult["savings"]> = {
        id: createId("savings"),
        createdAt: now(),
        ...savings,
      };

      await executor.execute(buildInsertStatement("savings_records", {
        id: record.id,
        request_event_id: record.requestEventId,
        optimization_action_id: record.optimizationActionId,
        gross_cost_usd: record.grossCostUsd,
        optimized_cost_usd: record.optimizedCostUsd,
        realized_savings_usd: record.realizedSavingsUsd,
        source: record.source,
        created_at: record.createdAt,
      }));

      return record;
    },
  };
}

export function createSqlLineageStore(
  executor: SqlLineageStatementExecutor,
  options?: SqlLineageAdapterOptions,
): LineageStore {
  return createLineageEventStore(createSqlLineageEventAdapter(executor, options));
}

export function createSqliteCliLineageEventAdapter(
  databasePath: string,
  options?: SqlLineageAdapterOptions,
): LineageEventWriteAdapter {
  return createSqlLineageEventAdapter(createSqliteCliLineageExecutor(databasePath), options);
}

export function createSqliteCliLineageStore(
  databasePath: string,
  options?: SqlLineageAdapterOptions,
): LineageStore {
  return createSqlLineageStore(createSqliteCliLineageExecutor(databasePath), options);
}

function createSqliteCliLineageExecutor(databasePath: string): SqlLineageStatementExecutor {
  return {
    async execute(statement) {
      await mkdir(dirname(databasePath), { recursive: true });
      await execFileAsync("sqlite3", [databasePath, statement]);
    },
  };
}

function defaultCreateId(kind: "request" | "action" | "savings"): string {
  return `${kind}_${randomUUID()}`;
}

function buildInsertStatement(tableName: string, values: Record<string, string | number | null>): string {
  const columns = Object.keys(values).join(", ");
  const literals = Object.values(values)
    .map(formatSqlValue)
    .join(", ");

  return `INSERT INTO ${tableName} (${columns}) VALUES (${literals})`;
}

function formatSqlValue(value: string | number | null): string {
  if (value === null) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  return `'${value.replaceAll("'", "''")}'`;
}
