const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const eventRoutes = require("./routes/events");

const productRoutes = require("./routes/products");
const recommendationRoutes = require("./routes/recommendations");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SmartRec API is running 🚀"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Temporary connection check; remove when no longer needed.
app.get("/api/test-db", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS time");
    res.json({ message: "Database connected", time: rows[0].time });
   } catch (error) {
    console.error("DATABASE ERROR:", error.message);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SmartRec server running on http://localhost:${PORT}`);
});
