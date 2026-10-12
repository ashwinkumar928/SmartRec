const WEIGHTS = Object.freeze({ SEARCH: 1, VIEW: 2, CART: 6 });
const DAY_MS = 24 * 60 * 60 * 1000;

function getRecencyMultiplier(createdAt, now = Date.now()) {
  const timestamp = createdAt == null ? NaN : new Date(createdAt).getTime();
  // Missing/invalid dates should not accidentally receive maximum influence.
  if (!Number.isFinite(timestamp)) return 0.1;
  const days = Math.floor(Math.max(0, now - timestamp) / DAY_MS);
  if (days <= 1) return 1;
  if (days <= 3) return 0.8;
  if (days <= 7) return 0.6;
  if (days <= 30) return 0.3;
  return 0.1;
}

function normalizeSearchQuery(query) {
  return typeof query === "string"
    ? [...new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean))]
    : [];
}

function productTags(product) {
  const tags = Array.isArray(product.tags) ? product.tags : [product.tags];
  return [...new Set(tags.filter(tag => typeof tag === "string")
    .map(tag => tag.trim().toLowerCase()).filter(Boolean))];
}

function buildSearchableText(product) {
  return [product.name, product.category, product.brand, product.color, ...productTags(product)]
    .map(value => String(value ?? "")).join(" ").toLowerCase();
}

function addScore(map, value, weight) {
  if (typeof value !== "string" || !value.trim()) return;
  const key = value.trim();
  map.set(key, (map.get(key) || 0) + weight);
}

function calculateUserInterest(events, products, now = Date.now()) {
  const scores = {
    interestScores: new Map(), tagScores: new Map(),
    brandScores: new Map(), keywordScores: new Map(),
  };
  const byId = new Map(products.map(product => [String(product.id), product]));
  for (const event of events) {
    if (!Object.hasOwn(WEIGHTS, event.eventType)) continue;
    const weight = WEIGHTS[event.eventType] * getRecencyMultiplier(event.createdAt, now);
    if (event.eventType === "SEARCH") {
      const words = normalizeSearchQuery(event.searchQuery);
      if (!words.length) continue;
      for (const word of words) addScore(scores.keywordScores, word, weight);
      const categories = new Set();
      const tags = new Set();
      const brands = new Set();
      for (const product of products) {
        const text = buildSearchableText(product);
        // Preserve existing all-words, case-insensitive substring matching.
        if (!words.every(word => text.includes(word))) continue;
        categories.add(product.category?.trim());
        brands.add(product.brand?.trim());
        for (const tag of productTags(product)) tags.add(tag);
      }
      for (const category of categories) addScore(scores.interestScores, category, weight);
      for (const tag of tags) addScore(scores.tagScores, tag, weight);
      for (const brand of brands) addScore(scores.brandScores, brand, weight);
    } else {
      const product = byId.get(String(event.productId));
      // Keep historical category-only events useful; infer category when absent.
      const category = typeof event.category === "string" && event.category.trim()
        ? event.category : product?.category;
      addScore(scores.interestScores, category, weight);
      if (!product) continue;
      for (const tag of productTags(product)) addScore(scores.tagScores, tag, weight);
      addScore(scores.brandScores, product.brand, weight);
    }
  }
  return scores;
}

function scoreProduct(product, scores) {
  const category = scores.interestScores.get(product.category?.trim()) || 0;
  const tags = productTags(product).reduce((sum, tag) => sum + (scores.tagScores.get(tag) || 0), 0);
  const brand = scores.brandScores.get(product.brand?.trim()) || 0;
  return category + tags * 0.35 + brand * 0.5;
}

function generateReason(product, scores, coldStart) {
  if (coldStart) return "Popular product for new users";
  const signals = [];
  if (scores.interestScores.get(product.category?.trim()) > 0) signals.push(product.category);
  if (scores.brandScores.get(product.brand?.trim()) > 0) signals.push(product.brand);
  const tags = productTags(product)
    .filter(tag => scores.tagScores.get(tag) > 0)
    .sort((a, b) => scores.tagScores.get(b) - scores.tagScores.get(a));
  for (const tag of tags) {
    if (signals.length >= 3) break;
    if (!signals.some(signal => signal.toLowerCase() === tag)) signals.push(tag);
  }
  if (!signals.length) return "Popular product based on rating";
  const last = signals.pop();
  const description = signals.length ? `${signals.join(", ")} and ${last}` : last;
  return `Based on your interest in ${description}`;
}

const roundScore = score => Math.round((score + Number.EPSILON) * 100) / 100;

module.exports = {
  getRecencyMultiplier, normalizeSearchQuery, buildSearchableText,
  calculateUserInterest, scoreProduct, generateReason, roundScore,
};
