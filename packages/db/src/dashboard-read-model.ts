import type { DashboardSummary } from "@promptshield/contracts/dashboard";

export type DashboardSummaryQuery = {
  recentOutcomeLimit?: number;
};

export interface DashboardReadModel {
  readDashboardSummary(query?: DashboardSummaryQuery): DashboardSummary;
}

export function createDashboardReadModel(readModel: DashboardReadModel): DashboardReadModel {
  return readModel;
}

export function createStaticDashboardReadModel(summary: DashboardSummary): DashboardReadModel {
  return createDashboardReadModel({
    readDashboardSummary(query) {
      const recentOutcomeLimit = normalizeRecentOutcomeLimit(query?.recentOutcomeLimit);

      return {
        metrics: summary.metrics,
        recentOutcomes:
          recentOutcomeLimit === undefined
            ? summary.recentOutcomes
            : summary.recentOutcomes.slice(0, recentOutcomeLimit),
      };
    },
  });
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
