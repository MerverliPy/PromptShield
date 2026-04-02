import assert from "node:assert/strict";
import test from "node:test";
import { buildRecommendationHelperServer } from "./server";

test("GET /health returns transitional helper identity", async () => {
  const app = buildRecommendationHelperServer();

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    ok: true,
    service: "optimizer-recommendation-helper",
    runtime: "typescript-helper",
    authority: "python",
  });

  await app.close();
});

test("POST /recommendations returns compress recommendation for large prompts", async () => {
  const app = buildRecommendationHelperServer();

  const response = await app.inject({
    method: "POST",
    url: "/recommendations",
    payload: {
      modelRequested: "gpt-4o",
      promptTokens: 14000,
      priority: "standard",
    },
  });

  assert.equal(response.statusCode, 200);

  const body = response.json();
  assert.ok(Array.isArray(body.recommendations));
  assert.equal(body.recommendations[0].type, "compress");

  await app.close();
});

test("POST /recommendations returns downgrade recommendation for low-priority expensive model", async () => {
  const app = buildRecommendationHelperServer();

  const response = await app.inject({
    method: "POST",
    url: "/recommendations",
    payload: {
      modelRequested: "gpt-4o",
      promptTokens: 2000,
      priority: "low",
    },
  });

  assert.equal(response.statusCode, 200);

  const body = response.json();
  const downgrade = body.recommendations.find(
    (item: { type: string }) => item.type === "downgrade",
  );

  assert.ok(downgrade);
  assert.equal(downgrade.suggestedModel, "gpt-4o-mini");

  await app.close();
});

test("POST /recommendations returns no_change when input is already within baseline", async () => {
  const app = buildRecommendationHelperServer();

  const response = await app.inject({
    method: "POST",
    url: "/recommendations",
    payload: {
      modelRequested: "gpt-4o-mini",
      promptTokens: 1500,
      priority: "standard",
    },
  });

  assert.equal(response.statusCode, 200);

  const body = response.json();
  assert.equal(body.recommendations[0].type, "no_change");

  await app.close();
});

test("POST /recommendations rejects invalid input", async () => {
  const app = buildRecommendationHelperServer();

  const response = await app.inject({
    method: "POST",
    url: "/recommendations",
    payload: {},
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    error: "modelRequested must be a non-empty string",
  });

  await app.close();
});
