export type HeuristicRecommendationType = "downgrade" | "compress" | "no_change";

export type HeuristicRecommendationPriority = "low" | "standard" | "high";

export type HeuristicRecommendationRequest = {
  modelRequested: string;
  promptTokens: number;
  completionTokens?: number;
  route?: string;
  priority?: HeuristicRecommendationPriority;
};

export type HeuristicRecommendation = {
  type: HeuristicRecommendationType;
  reason: string;
  suggestedModel?: string;
};

export type HeuristicRecommendationResponse = {
  recommendations: HeuristicRecommendation[];
};

export type RecommendationType = HeuristicRecommendationType;
export type RecommendationPriority = HeuristicRecommendationPriority;
export type RecommendationRequest = HeuristicRecommendationRequest;
export type Recommendation = HeuristicRecommendation;
export type RecommendationResponse = HeuristicRecommendationResponse;
