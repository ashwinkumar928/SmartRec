const express = require("express");
const cors = require("cors");
require("dotenv").config();
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SmartRec server running on http://localhost:${PORT}`);
});
