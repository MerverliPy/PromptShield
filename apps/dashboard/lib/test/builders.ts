export function buildDashboardMetric(overrides: Record<string, unknown> = {}) {
  return {
    key: "input_tokens",
    label: "Input tokens",
    value: 1234,
    note: "Stable metric note",
    ...overrides,
  };
}

export function buildDashboardOutcome(overrides: Record<string, unknown> = {}) {
  return {
    action: "saved",
    summary: "Saved cost by routing to a cheaper model.",
    ...overrides,
  };
}

export function buildDashboardSummary(overrides: Record<string, unknown> = {}) {
  return {
    metrics: [buildDashboardMetric()],
    recentOutcome: buildDashboardOutcome(),
    ...overrides,
  };
}
