const express = require("express");
const router = express.Router();

const events = require("../data/events");

router.post("/", (req, res) => {
  const {
    userId,
    eventType,
    productId,
    searchQuery,
    category
  } = req.body;

  if (!userId || !eventType) {
    return res.status(400).json({
      message: "userId and eventType are required"
    });
  }

  const event = {
    id: events.length + 1,
    userId,
    eventType,
    productId: productId || null,
    searchQuery: searchQuery || null,
    category: category || null,
    createdAt: new Date()
  };

  events.push(event);

  res.status(201).json(event);
});

router.get("/", (req, res) => {
  res.json(events);
});

module.exports = router;
