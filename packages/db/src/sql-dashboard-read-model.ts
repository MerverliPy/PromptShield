import { execFileSync } from "node:child_process";

import type {
  DashboardRecentOutcomeSummary,
  DashboardSummary,
} from "@promptshield/contracts/dashboard";

import {
  createDashboardReadModel,
  type DashboardReadModel,
  type DashboardSummaryQuery,
} from "./dashboard-read-model";

type SqlValue = number | string | null;

type SqlDashboardMetricsRow = {
  monthly_spend: SqlValue;
  recovered_margin: SqlValue;
  optimized_requests: SqlValue;
  recent_outcomes: SqlValue;
};

type SqlDashboardRecentOutcomeRow = {
  id: SqlValue;
  request_id: SqlValue;
  decision_kind: SqlValue;
  model_requested: SqlValue;
  model_served: SqlValue;
  realized_savings_usd: SqlValue;
  created_at: SqlValue;
};

export interface SqlDashboardQueryExecutor {
  query(statement: string): Array<Record<string, SqlValue>>;
}

export type SqlDashboardReadModelOptions = {
  now?: () => string;
};

const METRIC_IDS = [
  ["monthly_spend", "usd"],
  ["recovered_margin", "usd"],
  ["optimized_requests", "count"],
  ["recent_outcomes", "count"],
] as const;

const SAVINGS_BY_REQUEST_SUBQUERY = [
  "SELECT request_event_id,",
  "ROUND(SUM(optimized_cost_usd), 2) AS optimized_cost_usd,",
  "ROUND(SUM(realized_savings_usd), 2) AS realized_savings_usd",
  "FROM savings_records",
  "GROUP BY request_event_id",
].join(" ");

export function createSqlDashboardReadModel(
  executor: SqlDashboardQueryExecutor,
  options: SqlDashboardReadModelOptions = {},
): DashboardReadModel {
  const now = options.now ?? (() => new Date().toISOString());

  return createDashboardReadModel({
    readDashboardSummary(query) {
      const metricRow = executor.query(buildMetricsStatement(now()))[0] as SqlDashboardMetricsRow | undefined;
      const recentOutcomeLimit = normalizeRecentOutcomeLimit(query?.recentOutcomeLimit);
      const recentOutcomeRows = recentOutcomeLimit === 0
        ? []
        : executor.query(buildRecentOutcomesStatement(recentOutcomeLimit)) as SqlDashboardRecentOutcomeRow[];

      return {
        metrics: buildMetrics(metricRow, recentOutcomeRows.length),
        recentOutcomes: recentOutcomeRows.map(mapRecentOutcomeRow),
      } satisfies DashboardSummary;
    },
  });
}

export function createSqliteCliDashboardReadModel(
  databasePath: string,
  options?: SqlDashboardReadModelOptions,
): DashboardReadModel {
  return createSqlDashboardReadModel(createSqliteCliDashboardQueryExecutor(databasePath), options);
}

export function createSqliteCliDashboardQueryExecutor(databasePath: string): SqlDashboardQueryExecutor {
  return {
    query(statement) {
      const output = execFileSync("sqlite3", ["-json", databasePath, statement], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const payload = output.trim();

      return payload === "" ? [] : JSON.parse(payload) as Array<Record<string, SqlValue>>;
    },
  };
}

function buildMetrics(
  row: SqlDashboardMetricsRow | undefined,
  recentOutcomesCount: number,
): DashboardSummary["metrics"] {
  return METRIC_IDS.map(([id, unit]) => ({
    id,
    unit,
    value: id === "recent_outcomes" ? recentOutcomesCount : readSqlNumber(row?.[id]),
  }));
}

function mapRecentOutcomeRow(row: SqlDashboardRecentOutcomeRow): DashboardRecentOutcomeSummary {
  return {
    id: readSqlText(row.id),
    requestId: readSqlText(row.request_id),
    decisionKind: readSqlText(row.decision_kind) as DashboardRecentOutcomeSummary["decisionKind"],
    modelRequested: readSqlText(row.model_requested),
    modelServed: readSqlText(row.model_served),
    realizedSavingsUsd: readNullableSqlNumber(row.realized_savings_usd),
    createdAt: readSqlText(row.created_at),
  };
}

function buildMetricsStatement(nowIso: string): string {
  const { startOfMonthIso, startOfNextMonthIso } = getMonthBounds(nowIso);

  return [
    "SELECT",
    "COALESCE(ROUND(SUM(COALESCE(s.optimized_cost_usd, r.estimated_cost_usd)), 2), 0) AS monthly_spend,",
    "COALESCE(ROUND(SUM(COALESCE(s.realized_savings_usd, 0)), 2), 0) AS recovered_margin,",
    "COUNT(s.request_event_id) AS optimized_requests",
    "FROM request_events r",
    `LEFT JOIN (${SAVINGS_BY_REQUEST_SUBQUERY}) s ON s.request_event_id = r.id`,
    `WHERE r.created_at >= ${formatSqlText(startOfMonthIso)} AND r.created_at < ${formatSqlText(startOfNextMonthIso)}`,
  ].join(" ");
}

function buildRecentOutcomesStatement(recentOutcomeLimit?: number): string {
  const limitClause = recentOutcomeLimit === undefined ? "" : ` LIMIT ${recentOutcomeLimit}`;

  return [
    "SELECT",
    "r.id,",
    "r.request_id,",
    "r.decision_kind,",
    "r.model_requested,",
    "r.model_served,",
    "s.realized_savings_usd,",
    "r.created_at",
    "FROM request_events r",
    `LEFT JOIN (${SAVINGS_BY_REQUEST_SUBQUERY}) s ON s.request_event_id = r.id`,
    `ORDER BY r.created_at DESC, r.id DESC${limitClause}`,
  ].join(" ");
}

function getMonthBounds(nowIso: string) {
  const now = new Date(nowIso);

  if (Number.isNaN(now.valueOf())) {
    throw new Error(`Invalid dashboard read-model clock value: ${nowIso}`);
  }

  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    startOfMonthIso: startOfMonth.toISOString(),
    startOfNextMonthIso: startOfNextMonth.toISOString(),
  };
}

function normalizeRecentOutcomeLimit(limit: DashboardSummaryQuery["recentOutcomeLimit"]) {
  if (limit === undefined) {
    return undefined;
  }

  if (!Number.isFinite(limit)) {
    return 0;
  }

  return Math.max(0, Math.trunc(limit));
}

function readSqlNumber(value: SqlValue | undefined): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function readNullableSqlNumber(value: SqlValue | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readSqlNumber(value);
}

function readSqlText(value: SqlValue | undefined): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function formatSqlText(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
