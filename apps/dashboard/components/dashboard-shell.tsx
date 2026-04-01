import { MetricCard } from "@promptshield/ui/card";
import type { DashboardViewModel } from "../lib/view-models";

type DashboardShellProps = {
  dashboard: DashboardViewModel;
};

export function DashboardShell({ dashboard }: DashboardShellProps) {
  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ opacity: 0.7 }}>{dashboard.eyebrow}</p>
        <h1>{dashboard.title}</h1>
        <p style={{ maxWidth: 700, opacity: 0.75 }}>
          {dashboard.description}
        </p>
        <p
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.08)",
            fontSize: 12,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          {dashboard.dataIndicator}
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: 24,
        }}
      >
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section>
        <h2>{dashboard.recentOutcomesTitle}</h2>
        <ul>
          {dashboard.recentOutcomes.map((outcome) => (
            <li key={outcome.id}>{outcome.summary}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
