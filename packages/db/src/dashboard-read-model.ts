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
      const recentOutcomeLimit = query?.recentOutcomeLimit ?? summary.recentOutcomes.length;

      return {
        metrics: summary.metrics,
        recentOutcomes: summary.recentOutcomes.slice(0, recentOutcomeLimit),
      };
    },
  });
}
