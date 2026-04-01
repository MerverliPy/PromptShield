import Fastify from "fastify";
import type {
  HeuristicRecommendationRequest,
  HeuristicRecommendationResponse,
} from "@promptshield/contracts/recommendations";
import { buildHeuristicRecommendations } from "./lib/build-recommendations";

type HealthResponse = {
  ok: true;
  service: "optimizer";
};

type ErrorResponse = {
  error: string;
};

export function buildRecommendationHelperServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async (): Promise<HealthResponse> => {
    return { ok: true, service: "optimizer" };
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

  app
    .listen({ host: "0.0.0.0", port })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });
}
