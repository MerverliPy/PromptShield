import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { createSqliteCliLineageEventAdapter, type LineageEventWriteAdapter } from "@promptshield/db";
import type { FastifyBaseLogger } from "fastify";
import Fastify from "fastify";
import { registerChatCompletionsRoute } from "./routes/chat-completions";

const execFileAsync = promisify(execFile);

export async function buildServer(options: {
  lineageAdapter?: LineageEventWriteAdapter;
  lineageDatabasePath?: string;
} = {}) {
  const app = Fastify({ logger: true });
  const lineageAdapter =
    options.lineageAdapter ??
    (await createDefaultLineageAdapter(
      app.log,
      options.lineageDatabasePath ??
        process.env.PROMPTSHIELD_PROXY_LINEAGE_DB ??
        fileURLToPath(new URL("../.data/proxy-lineage.sqlite", import.meta.url)),
    ));

  app.get("/health", async () => {
    return { ok: true, service: "proxy" };
  });

  registerChatCompletionsRoute(app, { lineageAdapter });

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
): Promise<LineageEventWriteAdapter | undefined> {
  try {
    await execFileAsync("sqlite3", ["--version"]);
    return createSqliteCliLineageEventAdapter(databasePath);
  } catch (error) {
    log.warn({ err: error, databasePath }, "Proxy lineage persistence disabled: sqlite3 CLI not available");
    return undefined;
  }
}
