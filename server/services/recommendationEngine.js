const pool = require("../config/db");
const { toApiEvent } = require("./eventMapper");
const products = require("../data/products");

const WEIGHTS = { SEARCH: 1, VIEW: 2, CART: 6 };

async function generateRecommendations(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM user_events WHERE user_id = $1 ORDER BY created_at ASC",
    [userId]
  );
  const userEvents = rows.map(toApiEvent);
  const categoryScores = new Map();

  function addScore(category, weight) {
    if (typeof category !== "string" || !category.trim()) return;
    categoryScores.set(category, (categoryScores.get(category) || 0) + weight);
  }

  for (const event of userEvents) {
    if (event.eventType === "VIEW" || event.eventType === "CART") {
      addScore(event.category, WEIGHTS[event.eventType]);
    } else if (event.eventType === "SEARCH") {
      if (typeof event.searchQuery !== "string") continue;
      const words = event.searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) continue;

      const matchedCategories = new Set();
      for (const product of products) {
        const searchableText = [
          product.name, product.brand, product.category, product.color,
          ...(Array.isArray(product.tags) ? product.tags : [product.tags]),
        ].map(value => String(value ?? "")).join(" ").toLowerCase();

        if (words.every(word => searchableText.includes(word))) {
          matchedCategories.add(product.category);
        }
      }
      for (const category of matchedCategories) addScore(category, WEIGHTS.SEARCH);
    }
  }

  const recommendations = products.map(product => {
    const recommendationScore = categoryScores.get(product.category) || 0;
    return {
      ...product,
      recommendationScore,
      reason: recommendationScore > 0
        ? `High interest in ${product.category}`
        : userEvents.length === 0
          ? "Popular product for new users"
          : "Popular product based on rating",
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore || b.rating - a.rating);

  return {
    userId,
    interestScores: Object.fromEntries(categoryScores),
    recommendations,
  };
}

module.exports = { generateRecommendations };
