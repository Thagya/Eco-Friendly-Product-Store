// routes/cartRoutes.js - Simplified with JWT Authentication Only
const express = require("express");
const router = express.Router();

const {
  createCart,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require("../controllers/cartController");

const { verifyToken } = require("../middleware/authMiddleware");

// ========================================
// ALL CART ROUTES REQUIRE JWT AUTHENTICATION
// ========================================
router.use(verifyToken);

// ========================================
// CART MANAGEMENT ROUTES
// ========================================

// Create new cart
router.post("/", createCart);

// Get cart items
router.get("/", getCart);

// Clear cart
router.delete("/:cartId?", clearCart);

// Get cart summary
router.get("/summary", getCartSummary);

// ========================================
// CART ITEMS MANAGEMENT ROUTES
// ========================================

// Add item to cart
router.post("/items", addToCart);

// Update cart item quantity
router.put("/items/:id", updateCartItem);

// Remove item from cart
router.delete("/items/:id", removeFromCart);

// ========================================
// UTILITY ROUTES
// ========================================

// Validate cart before checkout
router.post("/validate", async (req, res) => {
  try {
    const userId = req.user.id;
    const Cart = require("../models/Cart");

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({ valid: false, message: 'Cart is empty' });
    }

    const totalPrice = cart.items.reduce((sum, item) =>
      sum + (item.product ? item.product.price * item.quantity : 0), 0
    );

    res.json({
      valid: true,
      totalItems: cart.items.length,
      totalPrice: Math.round(totalPrice * 100) / 100,
      message: 'Cart is valid for checkout'
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate cart' });
  }
});

// Get cart statistics
router.get("/statistics", async (req, res) => {
  try {
    const userId = req.user.id;
    const Cart = require("../models/Cart");

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.json({ totalItems: 0, totalValue: 0, uniqueProducts: 0 });
    }

    const validItems = cart.items.filter(item => item.product);
    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = validItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    res.json({
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      uniqueProducts: validItems.length
    });
  } catch (error) {
    console.error('Cart statistics error:', error);
    res.status(500).json({ error: 'Failed to generate cart statistics' });
  }
});

// Emergency cart backup
router.post("/backup", async (req, res) => {
  try {
    const userId = req.user.id;
    const Cart = require("../models/Cart");

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const backup = {
      userId,
      items: cart.items.map(item => ({
        productId: item.product ? item.product._id : null,
        productName: item.product ? item.product.name : 'Unknown Product',
        quantity: item.quantity,
        priceAtTime: item.product ? item.product.price : 0
      })),
      createdAt: cart.createdAt,
      backedUpAt: new Date().toISOString()
    };

    res.json({ message: 'Cart backup created successfully', backup });
  } catch (error) {
    console.error('Cart backup error:', error);
    res.status(500).json({ error: 'Failed to create cart backup' });
  }
});

module.exports = router;
