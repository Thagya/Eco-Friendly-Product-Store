// routes/authRoutes.js - Simplified for JWT auth only
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  createAdmin
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ----------------- PUBLIC ROUTES -----------------

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Create admin (one-time use)
router.post("/create-admin", createAdmin);

// ----------------- PROTECTED ROUTES -----------------

// Get profile
router.get("/profile", verifyToken, getProfile);

// Update profile
router.put("/profile", verifyToken, updateProfile);

// Change password
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
