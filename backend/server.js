const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Debug (optional)
console.log("Mongo URI:", process.env.MONGO_URI);

// ✅ Connect to MongoDB (UPDATED - no old options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* ================= ROUTES ================= */

// ✅ Default route (VERY IMPORTANT for Render/Vercel)
app.get("/", (req, res) => {
  res.send("🚀 Medical Billing API is running...");
});

// Import Routes
const medicineRoutes = require("./routes/medicines");
const billRoutes = require("./routes/bills");
const authRoutes = require("./routes/auth");

// Use Routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/auth", authRoutes);

// ❌ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});