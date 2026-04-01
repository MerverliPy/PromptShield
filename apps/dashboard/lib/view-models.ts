import type {
  DashboardMetricSummary,
  DashboardRecentOutcomeSummary,
  DashboardSummary,
} from "@promptshield/contracts/dashboard";

export type DashboardMetricSource = DashboardMetricSummary;

export type DashboardMetricViewModel = {
  label: string;
  value: string;
  note: string;
};

export type DashboardOutcomeSource = DashboardRecentOutcomeSummary;

export type DashboardOutcomeViewModel = {
  id: string;
  summary: string;
};

export type DashboardViewModelSource = DashboardSummary;

export type DashboardViewModel = {
  eyebrow: string;
  title: string;
  description: string;
  dataIndicator: string;
  metrics: DashboardMetricViewModel[];
  recentOutcomesTitle: string;
  recentOutcomes: DashboardOutcomeViewModel[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dashboardMetricMetadata: Record<string, { label: string; note: string }> = {
  monthly_spend: {
    label: "Monthly spend",
    note: "Current billable usage",
  },
  recovered_margin: {
    label: "Recovered margin",
    note: "Savings preserved this period",
  },
  optimized_requests: {
    label: "Optimized requests",
    note: "Requests with savings applied",
  },
  recent_outcomes: {
    label: "Recent outcomes",
    note: "Recorded in the current summary",
  },
};

export function createDashboardViewModel(
  source: DashboardViewModelSource,
  input: { dataIndicator: string },
): DashboardViewModel {
  return {
    eyebrow: "PromptShield",
    title: "Recovered margin, not token noise.",
    description:
      "Route traffic through the proxy, then monitor spend, avoidable waste, and policy decisions from one premium control surface.",
    dataIndicator: input.dataIndicator,
    metrics: source.metrics.map((metric) => ({
      label: getMetricMetadata(metric).label,
      value: formatMetricValue(metric),
      note: getMetricMetadata(metric).note,
    })),
    recentOutcomesTitle: "Recent optimization outcomes",
    recentOutcomes: source.recentOutcomes.map((outcome) => ({
      id: outcome.id,
      summary: formatOutcomeSummary(outcome),
    })),
  };
}

function getMetricMetadata(metric: DashboardMetricSource): { label: string; note: string } {
  return (
    dashboardMetricMetadata[metric.id] ?? {
      label: metric.id,
      note: "Summary metric",
    }
  );
}

function formatMetricValue(metric: DashboardMetricSource): string {
  if (metric.unit === "usd") {
    return currencyFormatter.format(metric.value);
  }

  return String(metric.value);
}

function formatOutcomeSummary(outcome: DashboardOutcomeSource): string {
  if (outcome.realizedSavingsUsd !== null && outcome.realizedSavingsUsd > 0) {
    return `${outcome.requestId} -> saved ${currencyFormatter.format(outcome.realizedSavingsUsd)}`;
  }

  if (outcome.modelRequested !== outcome.modelServed) {
    return `${outcome.requestId} -> rerouted to ${outcome.modelServed}`;
  }

  return `${outcome.requestId} -> ${formatDecisionKind(outcome.decisionKind)} on ${outcome.modelServed}`;
}

function formatDecisionKind(decisionKind: DashboardRecentOutcomeSummary["decisionKind"]): string {
  if (decisionKind === "downgrade") {
    return "downgraded";
  }

  if (decisionKind === "reject") {
    return "rejected";
  }

  return "served";
}
