import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { createSqliteCliLineageEventAdapter, type LineageEventWriteAdapter } from "@promptshield/db";
import type { FastifyBaseLogger } from "fastify";
import Fastify from "fastify";
import {
  registerChatCompletionsRoute,
  type LineagePersistenceState,
} from "./routes/chat-completions";

const execFileAsync = promisify(execFile);

export async function buildServer(options: {
  lineageAdapter?: LineageEventWriteAdapter;
  lineageDatabasePath?: string;
} = {}) {
  const app = Fastify({ logger: true });
  const { lineageAdapter, lineagePersistence } = await resolveLineagePersistence(app.log, options);

  app.get("/health", async () => {
    return { ok: true, service: "proxy", lineagePersistence };
  });

  registerChatCompletionsRoute(app, { lineageAdapter, lineagePersistence });

  return app;
}

async function start() {
  const app = await buildServer();
  await app.listen({ port: 4002, host: "0.0.0.0" });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

async function createDefaultLineageAdapter(
  log: Pick<FastifyBaseLogger, "warn">,
  databasePath: string,
): Promise<{ lineageAdapter?: LineageEventWriteAdapter; lineagePersistence: LineagePersistenceState }> {
  try {
    await execFileAsync("sqlite3", ["--version"]);
    return {
      lineageAdapter: createSqliteCliLineageEventAdapter(databasePath),
      lineagePersistence: { status: "active" },
    };
  } catch (error) {
    log.warn({ err: error, databasePath }, "Proxy lineage persistence disabled: sqlite3 CLI not available");
    return {
      lineageAdapter: undefined,
      lineagePersistence: { status: "unavailable", reason: "sqlite3_cli_unavailable" },
    };
  }
}

async function resolveLineagePersistence(
  log: Pick<FastifyBaseLogger, "warn">,
  options: {
    lineageAdapter?: LineageEventWriteAdapter;
    lineageDatabasePath?: string;
  },
): Promise<{ lineageAdapter?: LineageEventWriteAdapter; lineagePersistence: LineagePersistenceState }> {
  if (Object.prototype.hasOwnProperty.call(options, "lineageAdapter")) {
    return options.lineageAdapter
      ? {
          lineageAdapter: options.lineageAdapter,
          lineagePersistence: { status: "active" },
        }
      : {
          lineageAdapter: undefined,
          lineagePersistence: { status: "unavailable", reason: "adapter_unconfigured" },
        };
  }

  return createDefaultLineageAdapter(
    log,
    options.lineageDatabasePath ??
      process.env.PROMPTSHIELD_PROXY_LINEAGE_DB ??
      fileURLToPath(new URL("../.data/proxy-lineage.sqlite", import.meta.url)),
  );
}
