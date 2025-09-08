import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

// Helper function to get image URL
const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('data:image/')) return image; // Base64
  if (image.startsWith('http')) return image; // Full URL
  return image; // Return as is
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      alert('This product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({ productId: product._id, quantity: 1 });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const inCart = isInCart(product._id);
  const productImage = getImageUrl(product.image);

  if (!product) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:shadow-eco-green/20 hover:border-eco-green/30 transition-all duration-300 group"
    >
      <div className="relative">
        {/* Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {productImage && !imageError ? (
            <img
              src={productImage}
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

          {/* Quick actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-2 rounded-full ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleViewProduct}
              className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-full"
              title="View Product Details"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
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

        {/* Info */}
        <Link to={`/products/${product._id}`} className="block p-4 hover:bg-white/5 transition-colors">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-eco-green transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-eco-green/20 text-eco-green text-xs rounded-full">
              {product.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-eco-green">
              ${product.price}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                product.stock === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : inCart
                  ? 'bg-eco-green/20 text-eco-green border border-eco-green'
                  : 'bg-eco-green hover:bg-eco-leaf text-white'
              }`}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">
                    {product.stock === 0 ? 'Out of Stock' : inCart ? 'In Cart' : 'Add to Cart'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
