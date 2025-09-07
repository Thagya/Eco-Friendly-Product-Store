// ecommerce-backend/controllers/cartController.js - FIXED VERSION
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create a new cart
exports.createCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware
    
    // Check if user already has a cart
    let existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      return res.json({ 
        message: "Cart already exists", 
        cartId: existingCart._id 
      });
    }

    // Create new cart
    const cart = new Cart({ 
      user: userId,
      items: [] 
    });
    await cart.save();
    
    res.json({ 
      message: "Cart created", 
      cartId: cart._id 
    });
  } catch (err) {
    console.error("Create cart error:", err);
    res.status(500).json({ error: "Failed to create cart" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { cartId, productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ error: "productId & quantity required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Find or create cart
    let cart;
    if (cartId) {
      cart = await Cart.findOne({ _id: cartId, user: userId });
    } else {
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({ user: userId, items: [] });
    }

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${product.stock} items available` 
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          error: `Cannot add ${quantity} more items. Maximum ${product.stock} available` 
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    
    res.json({ 
      message: "Item added to cart", 
      cartId: cart._id,
      itemCount: cart.items.length
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: err.message || "Failed to add item to cart" });
  }
};

// Get cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId } = req.query;

    // Find cart by cartId and userId, or just by userId
    let cart;
    if (cartId) {
      cart = await Cart.findOne({ _id: cartId, user: userId }).populate("items.product");
    } else {
      cart = await Cart.findOne({ user: userId }).populate("items.product");
    }

    if (!cart) {
      return res.json([]); // Return empty array if no cart found
    }

    // Filter out items with null products (in case product was deleted)
    const validItems = cart.items.filter(item => item.product);

    // If we removed any items, save the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Transform cart items for frontend
    const cartItems = validItems.map((item) => ({
      id: item._id,
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image || "",
      stock: item.product.stock,
      category: item.product.category,
      description: item.product.description
    }));

    res.json(cartItems);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: err.message || "Failed to get cart" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Valid quantity required" });
    }

    // Find cart containing this item
    const cart = await Cart.findOne({ 
      "items._id": id,
      user: userId 
    }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Find the specific item
    const item = cart.items.id(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if product still exists
    if (!item.product) {
      return res.status(404).json({ error: "Product no longer available" });
    }

    // Check stock availability
    if (quantity > item.product.stock) {
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${item.product.stock} items available` 
      });
    }

    // Update quantity
    item.quantity = quantity;
    await cart.save();

    res.json({ 
      message: "Cart item updated successfully",
      itemId: id,
      newQuantity: quantity
    });
  } catch (err) {
    console.error("Update cart item error:", err);
    res.status(500).json({ error: err.message || "Failed to update cart item" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const userId = req.user.id;

    console.log(`Attempting to remove cart item ${id} for user ${userId}`);

    // Find cart containing this item
    const cart = await Cart.findOne({ 
      "items._id": id,
      user: userId 
    });

    if (!cart) {
      console.log("Cart item not found");
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Remove the item using MongoDB's pull method
    const itemToRemove = cart.items.id(id);
    if (!itemToRemove) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Remove item from cart
    cart.items.pull(id);
    await cart.save();

    console.log(`Successfully removed item ${id} from cart`);

    res.json({ 
      message: "Item removed from cart successfully",
      removedItemId: id,
      remainingItems: cart.items.length
    });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ error: err.message || "Failed to remove item from cart" });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId } = req.params;

    let cart;
    if (cartId) {
      cart = await Cart.findOne({ _id: cartId, user: userId });
    } else {
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ 
      message: "Cart cleared successfully",
      cartId: cart._id
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: err.message || "Failed to clear cart" });
  }
};

// Get cart summary (total items, total price)
exports.getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.json({ 
        totalItems: 0, 
        totalPrice: 0, 
        itemCount: 0 
      });
    }

    // Filter out items with null products
    const validItems = cart.items.filter(item => item.product);

    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    res.json({
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      itemCount: validItems.length,
      cartId: cart._id
    });
  } catch (err) {
    console.error("Get cart summary error:", err);
    res.status(500).json({ error: err.message || "Failed to get cart summary" });
  }
};

// Delete entire cart (for admin or when user account is deleted)
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOneAndDelete({ _id: cartId, user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.json({ 
      message: "Cart deleted successfully",
      deletedCartId: cartId 
    });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ error: "Failed to delete cart" });
  } 
};