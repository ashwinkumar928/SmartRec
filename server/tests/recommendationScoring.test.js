const { test } = require("node:test");
const assert = require("node:assert/strict");
const products = require("../data/products");
const { getRecencyMultiplier, calculateUserInterest, scoreProduct, generateReason, roundScore } = require("../services/recommendationScoring");
const NOW = Date.parse("2026-10-12T12:00:00Z");
const DAY = 86400000;
const at = days => new Date(NOW - days * DAY).toISOString();

test("decay uses completed 24-hour days at every boundary", () => {
  for (const [days, multiplier] of [[0, 1], [1.99, 1], [2, .8], [3.99, .8], [4, .6], [7.99, .6], [8, .3], [30.99, .3], [31, .1], [100, .1], [-1, 1]]) {
    assert.equal(getRecencyMultiplier(at(days), NOW), multiplier, `age ${days}`);
  }
  for (const date of [null, undefined, "invalid", ""]) assert.equal(getRecencyMultiplier(date, NOW), .1);
});

test("search, view and cart learn shoes, Nike, tags and keywords without mutating input", () => {
  const events = [
    { eventType: "SEARCH", searchQuery: " BLACK  running shoes black ", createdAt: at(0) },
    { eventType: "VIEW", productId: "3", category: "Shoes", createdAt: at(0) },
    { eventType: "CART", productId: 3, category: "Shoes", createdAt: at(0) },
  ];
  const original = JSON.stringify({ products, events });
  const scores = calculateUserInterest(events, products, NOW);
  assert.deepEqual(Object.fromEntries(scores.interestScores), { Shoes: 9 });
  assert.deepEqual(Object.fromEntries(scores.brandScores), { Nike: 9 });
  assert.deepEqual(Object.fromEntries(scores.tagScores), { shoes: 9, running: 9, sports: 9, black: 9 });
  assert.deepEqual(Object.fromEntries(scores.keywordScores), { black: 1, running: 1, shoes: 1 });
  assert.equal(roundScore(scoreProduct(products[2], scores)), 26.1);
  assert.equal(generateReason(products[2], scores, false), "Based on your interest in Shoes, Nike and running");
  assert.equal(JSON.stringify({ products, events }), original);
});

test("one search counts shared categories, tags, brands and repeated words only once", () => {
  const catalog = [products[0], { ...products[0], id: 99, tags: [...products[0].tags, " BLACK "] }];
  const scores = calculateUserInterest([{ eventType: "SEARCH", searchQuery: "shirt shirt", createdAt: at(0) }], catalog, NOW);
  assert.equal(scores.interestScores.get("Shirts"), 1);
  assert.equal(scores.brandScores.get("Roadster"), 1);
  assert.equal(scores.tagScores.get("black"), 1);
  assert.equal(scores.keywordScores.get("shirt"), 1);
  assert.equal(roundScore(scoreProduct(catalog[1], scores)), 3.25);
});

test("older actions decay all learned signals and recent behavior ranks higher", () => {
  const scores = calculateUserInterest([
    { eventType: "CART", productId: 3, createdAt: at(10) },
    { eventType: "VIEW", productId: 1, createdAt: at(0) },
    { eventType: "SEARCH", searchQuery: "unmatched", createdAt: at(5) },
  ], products, NOW);
  assert.equal(roundScore(scores.interestScores.get("Shoes")), 1.8);
  assert.equal(roundScore(scores.tagScores.get("running")), 1.8);
  assert.equal(roundScore(scores.brandScores.get("Nike")), 1.8);
  assert.equal(scores.keywordScores.get("unmatched"), .6);
  assert.ok(scoreProduct(products[0], scores) > scoreProduct(products[2], scores));
});

test("unknown products retain legacy categories; unknown keywords do not rank products", () => {
  const scores = calculateUserInterest([
    { eventType: "VIEW", productId: 999, category: "Shirts", createdAt: at(0) },
    { eventType: "CART", productId: null, createdAt: at(0) },
    { eventType: "SEARCH", searchQuery: "nonexistent", createdAt: at(0) },
    { eventType: "SEARCH", searchQuery: "  ", createdAt: at(0) },
    { eventType: "OTHER", category: "Shoes", createdAt: at(0) },
  ], products, NOW);
  assert.deepEqual(Object.fromEntries(scores.interestScores), { Shirts: 2 });
  assert.equal(scores.tagScores.size, 0);
  assert.equal(scores.brandScores.size, 0);
  assert.equal(scoreProduct(products[2], scores), 0);
  assert.equal(generateReason(products[0], scores, false), "Based on your interest in Shirts");
  assert.equal(generateReason(products[2], scores, false), "Popular product based on rating");
});
