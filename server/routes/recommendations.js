const express = require("express");
const { generateRecommendations } = require("../services/recommendationEngine");
const router = express.Router();

router.get("/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "userId must be a positive integer" });
  }
  res.json(generateRecommendations(userId));
});

module.exports = router;
