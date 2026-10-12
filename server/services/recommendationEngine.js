const pool = require("../config/db");
const { toApiEvent } = require("./eventMapper");
const products = require("../data/products");
const { calculateUserInterest, scoreProduct, generateReason, roundScore } = require("./recommendationScoring");

async function generateRecommendations(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM user_events WHERE user_id = $1 ORDER BY created_at ASC",
    [userId]
  );
  const userEvents = rows.map(toApiEvent);
  const scores = calculateUserInterest(userEvents, products);
  const recommendations = products.map(product => ({
    ...product,
    recommendationScore: roundScore(scoreProduct(product, scores)),
    reason: generateReason(product, scores, userEvents.length === 0),
  })).sort((a, b) => b.recommendationScore - a.recommendationScore || b.rating - a.rating);

  return {
    userId,
    ...Object.fromEntries(Object.entries(scores).map(([name, map]) => [
      name, Object.fromEntries([...map].map(([key, score]) => [key, roundScore(score)])),
    ])),
    recommendations,
  };
}

module.exports = { generateRecommendations };
