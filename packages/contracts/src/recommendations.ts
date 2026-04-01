export type RecommendationType = "downgrade" | "compress" | "no_change";

export type RecommendationPriority = "low" | "standard" | "high";

export type RecommendationRequest = {
  modelRequested: string;
  promptTokens: number;
  completionTokens?: number;
  route?: string;
  priority?: RecommendationPriority;
};

export type Recommendation = {
  type: RecommendationType;
  reason: string;
  suggestedModel?: string;
};

export type RecommendationResponse = {
  recommendations: Recommendation[];
};
