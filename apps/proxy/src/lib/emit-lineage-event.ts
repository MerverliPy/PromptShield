import type { FastifyBaseLogger } from "fastify";
import type { ProxyLineageEventPayload } from "./build-lineage-event";

type LineageEventLogger = Pick<FastifyBaseLogger, "debug">;

export function emitLineageEvent(input: {
  payload: ProxyLineageEventPayload;
  log: LineageEventLogger;
}): void {
  input.log.debug({ lineageEvent: input.payload }, "Proxy lineage event payload shell");
}
