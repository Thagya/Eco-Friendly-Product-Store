// src/components/products/ProductCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // redirect to login or show login modal
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const inCart = isInCart(product._id);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:shadow-eco-green/20 hover:border-eco-green/30 transition-all duration-300 group"
    >
      {/* Link wraps the entire card content */}
      <Link to={`/products/${product._id}`} className="block">
        {/* Image container */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 flex items-center justify-center">
              <Package className="w-12 h-12 text-eco-green" />
            </div>
          )}

          {/* Overlay quick actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            {/* Like button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Eye icon navigation */}
            <Link to={`/products/${product._id}`} onClick={(e) => e.stopPropagation()}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-full transition-colors cursor-pointer"
                title="View Product"
              >
                <Eye className="w-5 h-5" />
              </motion.div>
            </Link>
          </div>

          {/* Stock badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10
                ? "bg-green-500/80 text-green-100"
                : product.stock > 0
                ? "bg-yellow-500/80 text-yellow-100"
                : "bg-red-500/80 text-red-100"
            }`}>
              {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-eco-green transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Category */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-eco-green/20 text-eco-green text-xs font-medium rounded-full">
              {product.category}
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-eco-green">
                ${product.price}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                product.stock === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : inCart
                  ? 'bg-eco-green/20 text-eco-green border border-eco-green'
                  : 'bg-eco-green hover:bg-eco-leaf text-white hover:shadow-lg hover:shadow-eco-green/25'
              }`}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">
                    {product.stock === 0 
                      ? 'Out of Stock' 
                      : inCart 
                      ? 'In Cart' 
                      : 'Add to Cart'
                    }
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
