import { execFileSync } from "node:child_process";

type SqlValue = number | string | null;

type SqlSavingsRollupInputRow = {
  request_event_id: SqlValue;
  gross_cost_usd: SqlValue;
  optimized_cost_usd: SqlValue;
};

export type SavingsRollupInput = {
  requestEventId: string;
  grossCostUsd: number;
  optimizedCostUsd: number;
};

export interface SavingsRollupSource {
  readSavingsRollupInputs(): SavingsRollupInput[];
}

export interface SqlSavingsRollupQueryExecutor {
  query(statement: string): Array<Record<string, SqlValue>>;
}

const READ_SAVINGS_ROLLUP_INPUTS_STATEMENT = [
  "SELECT",
  "request_event_id,",
  "gross_cost_usd,",
  "optimized_cost_usd",
  "FROM savings_records",
  "ORDER BY created_at ASC, id ASC",
].join(" ");

export function createSqlSavingsRollupSource(
  executor: SqlSavingsRollupQueryExecutor,
): SavingsRollupSource {
  return {
    readSavingsRollupInputs() {
      return executor.query(READ_SAVINGS_ROLLUP_INPUTS_STATEMENT).map((row) =>
        mapSavingsRollupInputRow(row as SqlSavingsRollupInputRow),
      );
    },
  };
}

export function createSqliteCliSavingsRollupSource(databasePath: string): SavingsRollupSource {
  return createSqlSavingsRollupSource(createSqliteCliSavingsRollupQueryExecutor(databasePath));
}

export function createSqliteCliSavingsRollupQueryExecutor(
  databasePath: string,
): SqlSavingsRollupQueryExecutor {
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

function mapSavingsRollupInputRow(row: SqlSavingsRollupInputRow): SavingsRollupInput {
  return {
    requestEventId: readSqlText(row.request_event_id),
    grossCostUsd: readSqlNumber(row.gross_cost_usd),
    optimizedCostUsd: readSqlNumber(row.optimized_cost_usd),
  };
}

function readSqlNumber(value: SqlValue | undefined): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function readSqlText(value: SqlValue | undefined): string {
  return typeof value === "string" ? value : String(value ?? "");
}
