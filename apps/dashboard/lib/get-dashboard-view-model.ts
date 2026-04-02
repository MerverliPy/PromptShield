import { fileURLToPath } from "node:url";

import { createSqliteCliDashboardReadModel } from "@promptshield/db";

import { createDashboardViewModel } from "./view-models";
import { getFallbackDashboardViewModel } from "./mock-data";

export function getDashboardViewModel() {
  try {
    const summary = createSqliteCliDashboardReadModel(getLineageDatabasePath()).readDashboardSummary({
      recentOutcomeLimit: 3,
    });

    return createDashboardViewModel(summary, {
      dataIndicator: "Durable lineage summary",
    });
  } catch {
    return getFallbackDashboardViewModel();
  }
}

function getLineageDatabasePath() {
  return (
    process.env.PROMPTSHIELD_PROXY_LINEAGE_DB ??
    fileURLToPath(new URL("../../proxy/.data/proxy-lineage.sqlite", import.meta.url))
  );
}
