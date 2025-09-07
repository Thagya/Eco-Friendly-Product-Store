// controllers/productController.js (Fixed)
const Product = require("../models/Product");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get single product by id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    
    // Validation
    if (!name || !description || !price) {
      return res.status(400).json({ error: "Name, description & price are required" });
    }

    if (price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    if (stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    // Create product
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category || "General",
      image: image || "", // Can be base64 or URL
      stock: Number(stock) || 0
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ 
      message: "Product added successfully", 
      product,
      id: product._id 
    });
  } catch (err) {
    console.error('Add product error:', err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to add product" });
    }
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, stock } = req.body;

    // Validation
    if (price && price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    if (stock && stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image; // Allow empty string to clear image
    if (stock !== undefined) updateData.stock = Number(stock);

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ 
      message: "Product updated successfully", 
      product 
    });
  } catch (err) {
    console.error('Update product error:', err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else if (err.name === 'CastError') {
      res.status(400).json({ error: "Invalid product ID" });
    } else {
      res.status(500).json({ error: "Failed to update product" });
    }
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ 
      message: "Product deleted successfully",
      deletedId: id 
    });
  } catch (err) {
    console.error('Delete product error:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: "Invalid product ID" });
    } else {
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
};

// Search products (optional endpoint)
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchRegex = new RegExp(q, 'i');
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error('Search products error:', err);
    res.status(500).json({ error: "Failed to search products" });
  }
};

// Get products by category (optional endpoint)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products by category error:', err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};