const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const events = require("../data/events");
const products = require("../data/products");
const { generateRecommendations } = require("../services/recommendationEngine");

beforeEach(() => { events.length = 0; });

test("cold start returns all products by rating without changing the catalog", () => {
  const original = JSON.stringify(products);
  const result = generateRecommendations(1);
  assert.deepEqual(result.interestScores, {});
  assert.deepEqual(result.recommendations.map(p => p.id), [3, 1, 4, 2, 5]);
  assert.ok(result.recommendations.every(p => p.recommendationScore === 0 && p.reason === "Popular product for new users"));
  assert.equal(JSON.stringify(products), original);
});

test("weighted behavior ranks categories first, rating second, and isolates users", () => {
  events.push(
    { userId: 1, eventType: "SEARCH", searchQuery: "  BLACK   shirt " },
    { userId: "1", eventType: "VIEW", category: "Shirts", productId: 1 },
    { userId: 1, eventType: "CART", category: "Shirts", productId: 1 },
    { userId: 1, eventType: "VIEW", category: "Shoes" },
    { userId: 2, eventType: "CART", category: "Electronics" },
  );
  const result = generateRecommendations(1);
  assert.deepEqual(result.interestScores, { Shirts: 9, Shoes: 2 });
  assert.deepEqual(result.recommendations.map(p => p.id), [1, 2, 3, 4, 5]);
  assert.equal(result.recommendations[0].reason, "High interest in Shirts");
  assert.equal(result.recommendations[0].recommendationScore, 9);
  assert.equal(result.recommendations.length, products.length);
});

test("search scores each matched category once and searches all supported fields", () => {
  events.push({ userId: 1, eventType: "SEARCH", searchQuery: "shirt" });
  assert.deepEqual(generateRecommendations(1).interestScores, { Shirts: 1 });
  events.push({ userId: 1, eventType: "SEARCH", searchQuery: "black" });
  assert.deepEqual(generateRecommendations(1).interestScores, { Shirts: 2, Shoes: 1, Electronics: 1 });
  events.push({ userId: 1, eventType: "SEARCH", searchQuery: "roadster shirts black cotton oversized" });
  assert.deepEqual(generateRecommendations(1).interestScores, { Shirts: 3, Shoes: 1, Electronics: 1 });
});

test("empty, unmatched, malformed, and unsupported events do not add scores", () => {
  events.push(
    { userId: 1, eventType: "SEARCH", searchQuery: "  " },
    { userId: 1, eventType: "SEARCH", searchQuery: "black nonexistent" },
    { userId: 1, eventType: "SEARCH", searchQuery: null },
    { userId: 1, eventType: "VIEW" },
    { userId: 1, eventType: "OTHER", category: "Shirts" },
  );
  const result = generateRecommendations(1);
  assert.deepEqual(result.interestScores, {});
  assert.deepEqual(result.recommendations.map(p => p.id), [3, 1, 4, 2, 5]);
});

test("event POST/GET and recommendation GET share the same store", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/events", require("../routes/events"));
  app.use("/api/recommendations", require("../routes/recommendations"));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const event of [
      { userId: 1, eventType: "SEARCH", searchQuery: "black shirt" },
      { userId: 1, eventType: "VIEW", productId: 1, category: "Shirts" },
      { userId: 1, eventType: "CART", productId: 1, category: "Shirts" },
    ]) {
      const response = await fetch(`${base}/api/events`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event),
      });
      assert.equal(response.status, 201);
      const saved = await response.json();
      assert.equal(saved.eventType, event.eventType);
      assert.ok(saved.createdAt);
    }
    const saved = await (await fetch(`${base}/api/events`)).json();
    assert.equal(saved.length, 3);
    assert.equal(saved[2].id, 3);
    const result = await (await fetch(`${base}/api/recommendations/1`)).json();
    assert.equal(result.userId, 1);
    assert.deepEqual(result.interestScores, { Shirts: 9 });
    assert.equal(result.recommendations[0].id, 1);
    const cold = await (await fetch(`${base}/api/recommendations/999`)).json();
    assert.deepEqual(cold.interestScores, {});
    assert.equal(cold.recommendations[0].id, 3);
    assert.equal((await fetch(`${base}/api/recommendations/invalid`)).status, 400);
    assert.equal((await fetch(`${base}/api/events`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    })).status, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
