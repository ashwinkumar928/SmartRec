const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const { toApiEvent } = require("../services/eventMapper");

router.post("/", async (req, res) => {
  const {
    userId,
    eventType,
    productId,
    searchQuery,
    category
  } = req.body || {};

  if (!userId || !eventType) {
    return res.status(400).json({
      message: "userId and eventType are required"
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO user_events (user_id, event_type, product_id, search_query, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, eventType, productId || null, searchQuery || null, category || null]
    );
    res.status(201).json(toApiEvent(rows[0]));
  } catch {
    res.status(500).json({ message: "Failed to save event" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM user_events ORDER BY created_at ASC");
    res.json(rows.map(toApiEvent));
  } catch {
    res.status(500).json({ message: "Failed to load events" });
  }
});

module.exports = router;
