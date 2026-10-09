const API_URL = "http://localhost:5000";

export const trackEvent = async ({
  userId = 1,
  eventType,
  productId = null,
  searchQuery = null,
  category = null
}) => {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        userId,
        eventType,
        productId,
        searchQuery,
        category
      })
    });

    if (!response.ok) {
      throw new Error("Failed to track event");
    }

    return await response.json();

  } catch (error) {
    console.error("Event tracking error:", error);
  }
};