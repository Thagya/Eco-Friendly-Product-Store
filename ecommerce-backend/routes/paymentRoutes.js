const express = require("express");
const router = express.Router();
const { 
  createCheckoutSession, 
  handlePaymentSuccess,
  handleWebhook,
  getPaymentHistory,
  processBuyNow,
  testStripe
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Webhook route (no auth, Stripe verifies)
router.post("/webhook", express.raw({ type: 'application/json' }), handleWebhook);

// Test route (requires auth)
router.get("/test-stripe", verifyToken, testStripe);

// Protected routes
router.use(verifyToken);

// Payment processing
router.post("/create-checkout-session", createCheckoutSession);
router.post("/buy-now", processBuyNow);
router.post("/success", handlePaymentSuccess);

// Payment history
router.get("/history", getPaymentHistory);

module.exports = router;
