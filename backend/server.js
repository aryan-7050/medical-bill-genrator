const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Debug (optional but useful)
console.log("Mongo URI:", process.env.MONGO_URI);

// ✅ MongoDB Connect (FIXED)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Routes
const medicineRoutes = require("./routes/medicines");
const billRoutes = require("./routes/bills");
const authRoutes = require("./routes/auth");

app.use("/api/medicines", medicineRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/auth", authRoutes);

// ✅ Default Route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("🚀 Medical Billing API is running...");
});

// ❌ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});