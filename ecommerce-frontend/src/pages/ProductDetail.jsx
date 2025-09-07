// src/pages/ProductDetail.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Leaf,
  Package,
  CreditCard
} from 'lucide-react';

import { fetchProductById, clearCurrentProduct } from '../store/productsSlice';
import { addToCart, createCart, openCartDrawer } from '../store/cartSlice';
import { useCart } from '../hooks/useCart';
import Loading from '../components/common/Loading';

// Helper function to get image URL
const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('data:image/')) return image; // Base64
  if (image.startsWith('http')) return image; // Full URL
  return image; // Return as is
};

// Quantity Selector Component
const QuantitySelector = ({ quantity, setQuantity, maxStock }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-300">Quantity:</span>
      <div className="flex items-center bg-white/10 rounded-lg border border-white/20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 text-gray-300 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        
        <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
          {quantity}
        </span>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
          className="p-2 text-gray-300 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
      <span className="text-sm text-gray-400">
        {maxStock} in stock
      </span>
    </div>
  );
};

// Feature Badge Component
const FeatureBadge = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-eco-green/30 transition-all duration-300"
  >
    <div className="w-10 h-10 bg-eco-green/20 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-eco-green" />
    </div>
    <div>
      <div className="text-white font-semibold text-sm">{title}</div>
      <div className="text-gray-400 text-xs">{description}</div>
    </div>
  </motion.div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartId, addToCart: addToCartAction } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!currentProduct?._id) {
      alert('Product not found');
      return;
    }

    try {
      await addToCartAction(currentProduct._id, quantity);
      // Show success message (you can implement toast here)
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with purchase');
      navigate('/login');
      return;
    }

    // Add to cart first, then navigate to checkout
    try {
      await addToCartAction(currentProduct._id, quantity);
      navigate('/checkout');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          text: currentProduct?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product not found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-eco-green hover:bg-eco-leaf text-white font-semibold rounded-xl transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Leaf,
      title: "100% Eco-Friendly",
      description: "Sustainably sourced materials"
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "Premium quality assurance"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $50"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy"
    }
  ];

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
  ];

  const productImage = getImageUrl(currentProduct.image);

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </motion.button>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden aspect-square">
              {productImage && !imageError ? (
                <img
                  src={productImage}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-eco-green/20 to-eco-leaf/20">
                  <Package className="w-32 h-32 text-eco-green" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square bg-white/10 rounded-lg border border-white/20 hover:border-white/40 cursor-pointer transition-all duration-300"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {index === 0 && productImage && !imageError ? (
                      <img
                        src={productImage}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-eco-green" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-eco-green/20 text-eco-green text-sm rounded-full">
                  {currentProduct.category}
                </span>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-2 bg-white/10 text-gray-300 hover:text-white rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {currentProduct.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-gray-300 ml-2">(4.2) · 127 reviews</span>
                </div>
              </div>

              <div className="text-4xl font-bold text-eco-green mb-6">
                ${currentProduct.price}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  currentProduct.stock > 10
                    ? "bg-green-500/20 text-green-400"
                    : currentProduct.stock > 0
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {currentProduct.stock > 0 
                    ? `${currentProduct.stock} in stock` 
                    : "Out of stock"
                  }
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div className="prose prose-invert">
              <p className="text-gray-300 text-lg leading-relaxed">
                {currentProduct.description}
              </p>
            </div>

            {/* Quantity Selector */}
            {currentProduct.stock > 0 && (
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                maxStock={currentProduct.stock}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-eco-green/25 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{currentProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={currentProduct.stock === 0}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
              >
                <CreditCard className="w-5 h-5" />
                <span>Buy Now</span>
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeatureBadge key={index} {...feature} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-eco-green border-b-2 border-eco-green'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {currentProduct.description}
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  This eco-friendly product is carefully crafted using sustainable materials and ethical manufacturing processes. 
                  Perfect for environmentally conscious consumers who don't want to compromise on quality or style.
                </p>
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Product Details</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{currentProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span>{currentProduct.stock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span>${currentProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material:</span>
                      <span>100% Recycled</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-gray-400">Reviews feature coming soon...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;