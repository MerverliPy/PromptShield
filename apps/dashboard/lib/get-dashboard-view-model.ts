import { createSqliteCliDashboardReadModel } from "@promptshield/db";

import { createDashboardViewModel } from "./view-models";
import { getFallbackDashboardViewModel } from "./mock-data";

export function getDashboardViewModel() {
  const databasePath = process.env.PROMPTSHIELD_PROXY_LINEAGE_DB;

  if (!databasePath) {
    return getFallbackDashboardViewModel();
  }

  try {
    const summary = createSqliteCliDashboardReadModel(databasePath).readDashboardSummary({
      recentOutcomeLimit: 3,
    });

    return createDashboardViewModel(summary, {
      dataIndicator: "Durable lineage summary: live database read",
    });
  } catch {
    return getFallbackDashboardViewModel();
  }
}
