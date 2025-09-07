// routes/productRoutes.js - Simplified with JWT Auth & Admin Check
const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
} = require("../controllers/productController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");


// ========================================
// PUBLIC ROUTES
// ========================================

// Get all products
router.get("/", getProducts);

// Search products
router.get("/search", searchProducts);

// Get products by category
router.get("/category/:category", getProductsByCategory);

// Get product by ID
router.get("/:id", getProductById);

// ========================================
// ADMIN ONLY ROUTES (PROTECTED)
// ========================================

// Add new product (admin only)
router.post("/", verifyToken, isAdmin, addProduct);

// Update product (admin only)
router.put("/:id", verifyToken, isAdmin, updateProduct);

// Delete product (admin only)
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

// ========================================
// ADMIN UTILITY ROUTES (optional)
// ========================================

// Example: Get product statistics (admin only)
router.get("/admin/statistics", verifyToken, isAdmin, async (req, res) => {
  try {
    const Product = require("../models/Product");
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      inStockProducts: totalProducts - outOfStockProducts,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Product statistics error:', error);
    res.status(500).json({ error: 'Failed to generate statistics' });
  }
});

module.exports = router;
