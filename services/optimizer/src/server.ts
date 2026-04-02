import Fastify from "fastify";
import type {
  HeuristicRecommendationRequest,
  HeuristicRecommendationResponse,
} from "@promptshield/contracts/recommendations";
import { buildHeuristicRecommendations } from "./lib/build-recommendations";

const HELPER_SERVICE_NAME = "optimizer-recommendation-helper" as const;
const HELPER_RUNTIME = "typescript-helper" as const;
const AUTHORITATIVE_RUNTIME = "python" as const;

type HealthResponse = {
  ok: true;
  service: typeof HELPER_SERVICE_NAME;
  runtime: typeof HELPER_RUNTIME;
  authority: typeof AUTHORITATIVE_RUNTIME;
};

type ErrorResponse = {
  error: string;
};

export function buildRecommendationHelperServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async (): Promise<HealthResponse> => {
    return {
      ok: true,
      service: HELPER_SERVICE_NAME,
      runtime: HELPER_RUNTIME,
      authority: AUTHORITATIVE_RUNTIME,
    };
  });

  app.post<{
    Body: HeuristicRecommendationRequest;
    Reply: HeuristicRecommendationResponse | ErrorResponse;
  }>("/recommendations", async (request, reply) => {
    const body = request.body;

    if (!body || typeof body !== "object") {
      reply.code(400);
      return { error: "request body is required" };
    }

    if (typeof body.modelRequested !== "string" || body.modelRequested.length === 0) {
      reply.code(400);
      return { error: "modelRequested must be a non-empty string" };
    }

    if (typeof body.promptTokens !== "number" || Number.isNaN(body.promptTokens)) {
      reply.code(400);
      return { error: "promptTokens must be a number" };
    }

    const normalized: HeuristicRecommendationRequest = {
      modelRequested: body.modelRequested,
      promptTokens: body.promptTokens,
      completionTokens: body.completionTokens,
      route: body.route,
      priority: body.priority ?? "standard",
    };

    reply.code(200);
    return buildHeuristicRecommendations(normalized);
  });

  return app;
}

export const buildServer = buildRecommendationHelperServer;

const port = Number(process.env.PORT ?? 4003);

if (
  process.env.NODE_ENV !== "test" &&
  process.env.ENABLE_TRANSITIONAL_RECOMMENDATION_HELPER === "true"
) {
  const app = buildRecommendationHelperServer();

  app.log.info(
    {
      service: HELPER_SERVICE_NAME,
      runtime: HELPER_RUNTIME,
      authority: AUTHORITATIVE_RUNTIME,
    },
    "starting transitional recommendation helper",
  );

  app
    .listen({ host: "0.0.0.0", port })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });
}
