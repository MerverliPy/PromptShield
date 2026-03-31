import { MetricCard } from "@promptshield/ui/card";

const metrics = [
  { label: "Monthly spend", value: "$482.10", note: "Current billable usage" },
  { label: "Recovered margin", value: "$91.34", note: "Savings preserved this month" },
  { label: "Budget drift", value: "6.2%", note: "Above target baseline" },
  { label: "Optimized requests", value: "38%", note: "Compression or reroute applied" },
];

export function DashboardShell() {
  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ opacity: 0.7 }}>PromptShield</p>
        <h1>Recovered margin, not token noise.</h1>
        <p style={{ maxWidth: 700, opacity: 0.75 }}>
          Route traffic through the proxy, then monitor spend, avoidable waste,
          and policy decisions from one premium control surface.
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
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section>
        <h2>Recent optimization outcomes</h2>
        <ul>
          <li>chat.generate → compressed context by 19%</li>
          <li>support.summarize → downgraded to lower-cost model</li>
          <li>agent.plan → preserved protected instructions; no compression applied</li>
        </ul>
      </section>
    </main>
  );
}
