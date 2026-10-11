// pg returns BIGINT values as strings. Keep familiar numeric IDs when safe,
// and retain strings for larger IDs to avoid losing precision.
function apiId(value) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : String(value);
}

function toApiEvent(row) {
  return {
    id: apiId(row.id),
    userId: apiId(row.user_id),
    eventType: row.event_type,
    productId: apiId(row.product_id),
    searchQuery: row.search_query,
    category: row.category,
    createdAt: row.created_at,
  };
}

module.exports = { toApiEvent };
