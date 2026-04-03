export function buildProxyRequest(overrides: Record<string, unknown> = {}) {
  return {
    model: "gpt-5.4",
    messages: [{ role: "user", content: "hello" }],
    max_tokens: 200,
    ...overrides,
  };
}

export function buildLineageEvent(overrides: Record<string, unknown> = {}) {
  return {
    decision: "allow",
    requestId: "req-test-1",
    model: "gpt-5.4",
    ...overrides,
  };
}
