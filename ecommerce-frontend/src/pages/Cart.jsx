// src/pages/Cart.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard, 
  ShoppingBag, 
  Package,
  ArrowLeft,
  Heart
} from "lucide-react";
import { 
  fetchCart, 
  removeFromCart, 
  updateCartItem,
  clearError 
} from "../store/cartSlice";
import Loading from "../components/common/Loading";

// Helper function to get image URL
const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('data:image/')) return image; // Base64
  if (image.startsWith('http')) return image; // Full URL
  return image; // Return as is
};

// Cart Item Component
const CartItemCard = ({ item, onQuantityUpdate, onRemove, isUpdating }) => {
  const [imageError, setImageError] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  
  const productImage = getImageUrl(item.image);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} items available in stock`);
      return;
    }
    
    setLocalQuantity(newQuantity);
    onQuantityUpdate(item.id, newQuantity);
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      onRemove(item.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:border-eco-green/30 transition-all duration-300"
    >
      <div className="flex items-center space-x-6">
        
        {/* Product Image */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex-shrink-0">
          {productImage && !imageError ? (
            <img
              src={productImage}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-eco-green" />
            </div>
          )}
          
          {/* Stock status indicator */}
          {item.stock < 5 && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white/20" 
                 title={`Only ${item.stock} left`} />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate mb-1">
            {item.name}
          </h3>
          <p className="text-gray-400 text-sm mb-2">
            Category: {item.category || 'General'}
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-eco-green font-bold text-xl">
              ${item.price}
            </span>
            <span className="text-gray-400 text-sm">
              Stock: {item.stock}
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Qty:</span>
            <div className="flex items-center bg-white/10 border border-white/20 rounded-lg">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(localQuantity - 1)}
                disabled={isUpdating || localQuantity <= 1}
                className="p-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </motion.button>

              <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
                {localQuantity}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(localQuantity + 1)}
                disabled={isUpdating || localQuantity >= item.stock}
                className="p-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <div className="text-white font-bold text-lg">
              ${(item.price * localQuantity).toFixed(2)}
            </div>
            {localQuantity > 1 && (
              <div className="text-gray-400 text-sm">
                ${item.price} each
              </div>
            )}
          </div>

          {/* Remove Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Remove from cart"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-5 h-5 border-2 border-eco-green border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Empty Cart Component
const EmptyCart = ({ onContinueShopping }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 rounded-full flex items-center justify-center"
    >
      <ShoppingBag className="w-16 h-16 text-eco-green" />
    </motion.div>
    
    <h2 className="text-3xl font-bold text-white mb-4">
      Your Cart is Empty
    </h2>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      Looks like you haven't added any eco-friendly products to your cart yet. 
      Start shopping to fill it with amazing sustainable products!
    </p>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onContinueShopping}
      className="px-8 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-eco-green/25 transition-all duration-300"
    >
      Continue Shopping
    </motion.button>
  </motion.div>
);

// Cart Summary Component
const CartSummary = ({ items, onCheckout, isProcessing }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sticky top-8"
    >
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <ShoppingBag className="w-6 h-6 mr-2" />
        Order Summary
      </h3>

      {/* Summary Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>Items ({totalItems}):</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Shipping:</span>
          <span className="text-eco-green">Free</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Tax (8%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-white/20 pt-4 flex justify-between text-xl font-bold text-white">
          <span>Total:</span>
          <span className="text-eco-green">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCheckout}
        disabled={isProcessing || items.length === 0}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-eco-green/25 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Proceed to Checkout</span>
          </>
        )}
      </motion.button>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-400">
        <div className="w-3 h-3 bg-eco-green rounded-full" />
        <span>Secure checkout with SSL encryption</span>
      </div>
    </motion.div>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items, totalItems, totalPrice, isLoading, error, cartId } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart data
  useEffect(() => {
    if (isAuthenticated && cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [dispatch, isAuthenticated, cartId]);

  // Clear any errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      // Refresh cart after update
      if (cartId) {
        await dispatch(fetchCart(cartId));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      // Refresh cart after removal
      if (cartId) {
        await dispatch(fetchCart(cartId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    // Add a small delay to show loading state
    setTimeout(() => {
      navigate('/checkout');
      setIsProcessing(false);
    }, 1000);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (!isAuthenticated) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => navigate('/products')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </motion.button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Shopping <span className="text-eco-green">Cart</span>
            </h1>
            {items.length > 0 && (
              <p className="text-gray-300 mt-2">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            )}
          </div>

          <div className="w-32" /> {/* Spacer for centering */}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {items.length === 0 ? (
          <EmptyCart onContinueShopping={handleContinueShopping} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <AnimatePresence>
                  {items.map((item, index) => (
                    <CartItemCard
                      key={item.id || index}
                      item={item}
                      onQuantityUpdate={handleQuantityUpdate}
                      onRemove={handleRemoveItem}
                      isUpdating={updatingItems.has(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Additional Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinueShopping}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 text-gray-300 font-semibold rounded-xl hover:bg-white/20 hover:text-white transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>Save for Later</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary 
                items={items}
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;