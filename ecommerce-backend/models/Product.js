// models/Product.js (Fixed)
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },            
  description: { 
    type: String, 
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },     
  price: { 
    type: Number, 
    required: [true, 'Product price is required'],
    min: [0.01, 'Price must be greater than 0']
  },           
  category: { 
    type: String, 
    default: "General",
    enum: {
      values: ['Eco Bags', 'Water Bottles', 'Reusable Items', 'Solar Products', 'Organic', 'General'],
      message: '{VALUE} is not a valid category'
    }
  },    
  image: { 
    type: String, 
    default: "",
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        // Check if it's a base64 string or valid URL
        if (v.startsWith('data:image/')) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid image format. Must be a valid URL or base64 string.'
    }
  },              
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },               
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// Virtual for product age
productSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to check if product is low stock
productSchema.methods.isLowStock = function(threshold = 10) {
  return this.stock <= threshold && this.stock > 0;
};

// Static method to get low stock products
productSchema.statics.getLowStock = function(threshold = 10) {
  return this.find({ stock: { $lte: threshold, $gt: 0 } });
};

// Static method to get out of stock products
productSchema.statics.getOutOfStock = function() {
  return this.find({ stock: 0 });
};

module.exports = mongoose.model("Product", productSchema);