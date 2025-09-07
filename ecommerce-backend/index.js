// index.js - Simplified JWT Auth Setup
const express = require("express");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({  limit: "10mb", extended: true }));

// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "EcoStore API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((err, req, res, next) => {
  console.error("🚨 Global Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ========================================
// SERVER STARTUP
// ========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 EcoStore API running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down');
  server.close(() => console.log('💤 Process terminated'));
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down');
  server.close(() => console.log('💤 Process terminated'));
});

module.exports = app;
