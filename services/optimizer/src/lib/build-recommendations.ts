import type {
  Recommendation,
  RecommendationRequest,
  RecommendationResponse,
} from "@promptshield/contracts/recommendations";

export function buildRecommendations(
  input: RecommendationRequest,
): RecommendationResponse {
  const recommendations: Recommendation[] = [];

  if (input.promptTokens > 12_000) {
    recommendations.push({
      type: "compress",
      reason: "prompt exceeds efficient context threshold",
    });
  }

  if (
    input.priority === "low" &&
    (input.modelRequested === "gpt-4o" ||
      input.modelRequested === "claude-3-5-sonnet")
  ) {
    recommendations.push({
      type: "downgrade",
      reason: "low-priority request can use a lower-cost model",
      suggestedModel:
        input.modelRequested === "claude-3-5-sonnet"
          ? "claude-3-5-haiku"
          : "gpt-4o-mini",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "no_change",
      reason: "request is already within baseline thresholds",
    });
  }

  return { recommendations };
}
