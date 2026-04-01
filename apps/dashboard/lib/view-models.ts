export type DashboardMetricViewModel = {
  label: string;
  value: string;
  note: string;
};

export type DashboardOutcomeViewModel = {
  id: string;
  summary: string;
};

export type DashboardViewModel = {
  eyebrow: string;
  title: string;
  description: string;
  dataIndicator: string;
  metrics: DashboardMetricViewModel[];
  recentOutcomesTitle: string;
  recentOutcomes: DashboardOutcomeViewModel[];
};
