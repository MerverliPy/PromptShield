import type { DashboardViewModel } from "./view-models";

export function getMockDashboardViewModel(): DashboardViewModel {
  return {
    eyebrow: "PromptShield",
    title: "Recovered margin, not token noise.",
    description:
      "Route traffic through the proxy, then monitor spend, avoidable waste, and policy decisions from one premium control surface.",
    dataIndicator: "Demo data",
    metrics: [
      {
        label: "Monthly spend",
        value: "$482.10",
        note: "Current billable usage",
      },
      {
        label: "Recovered margin",
        value: "$91.34",
        note: "Savings preserved this month",
      },
      {
        label: "Budget drift",
        value: "6.2%",
        note: "Above target baseline",
      },
      {
        label: "Optimized requests",
        value: "38%",
        note: "Compression or reroute applied",
      },
    ],
    recentOutcomesTitle: "Recent optimization outcomes",
    recentOutcomes: [
      {
        id: "chat-generate",
        summary: "chat.generate -> compressed context by 19%",
      },
      {
        id: "support-summarize",
        summary: "support.summarize -> downgraded to lower-cost model",
      },
      {
        id: "agent-plan",
        summary:
          "agent.plan -> preserved protected instructions; no compression applied",
      },
    ],
  };
}
