/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { DashboardShell } from "./dashboard-shell";

test("DashboardShell renders the dashboard heading, indicator, metrics, and recent outcomes", () => {
  const dashboard = {
    eyebrow: "PromptShield",
    title: "Recovered margin, not token noise.",
    description:
      "Route traffic through the proxy, then monitor spend, avoidable waste, and policy decisions from one premium control surface.",
    dataIndicator: "Durable lineage summary",
    metrics: [
      {
        label: "Monthly spend",
        value: "$1.75",
        note: "Current billable usage",
      },
      {
        label: "Recovered margin",
        value: "$2.50",
        note: "Savings preserved this period",
      },
      {
        label: "Optimized requests",
        value: "1",
        note: "Requests with savings applied",
      },
      {
        label: "Recent outcomes",
        value: "1",
        note: "Recorded in the current summary",
      },
    ],
    recentOutcomesTitle: "Recent optimization outcomes",
    recentOutcomes: [
      {
        id: "request-1",
        summary: "chat.generate -> saved $2.50",
      },
      {
        id: "request-2",
        summary: "chat.reject -> rejected on gpt-4.1",
      },
    ],
  };

  const markup = renderToStaticMarkup(DashboardShell({ dashboard }));

  assert.ok(markup.includes(dashboard.title));
  assert.ok(markup.includes(dashboard.dataIndicator));
  assert.ok(markup.includes(dashboard.recentOutcomesTitle));

  for (const metric of dashboard.metrics) {
    assert.ok(markup.includes(metric.label));
    assert.ok(markup.includes(metric.value));
    assert.ok(markup.includes(metric.note));
  }

  for (const outcome of dashboard.recentOutcomes) {
    assert.ok(markup.includes(outcome.summary.replaceAll(">", "&gt;")));
  }
});
