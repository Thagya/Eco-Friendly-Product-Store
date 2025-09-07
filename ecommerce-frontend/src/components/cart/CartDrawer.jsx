// src/components/cart/CartDrawer.jsx - FIXED ROUTING VERSION
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Package,
  CreditCard,
  Eye
} from 'lucide-react';

import {
  toggleCartDrawer,
  closeCartDrawer,
  fetchCart,
  updateCartItem,
  removeFromCart
} from '../../store/cartSlice';
import CartItem from './CartItem';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    isDrawerOpen, 
    items, 
    cartId, 
    totalItems, 
    totalPrice, 
    isLoading 
  } = useSelector((state) => state.cart);
  
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isDrawerOpen && cartId && isAuthenticated) {
      dispatch(fetchCart(cartId));
    }
  }, [dispatch, isDrawerOpen, cartId, isAuthenticated]);

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      // Refresh cart
      if (cartId) {
        dispatch(fetchCart(cartId));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      // Refresh cart
      if (cartId) {
        dispatch(fetchCart(cartId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleViewFullCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Navigating to cart page...');
    dispatch(closeCartDrawer());
    
    // Use setTimeout to ensure drawer closes first
    setTimeout(() => {
      navigate('/cart');
    }, 100);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    console.log('Navigating to checkout page...');
    dispatch(closeCartDrawer());
    
    // Use setTimeout to ensure drawer closes first
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
  };

  const handleContinueShopping = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(closeCartDrawer());
    setTimeout(() => {
      navigate('/products');
    }, 100);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => dispatch(closeCartDrawer())}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900/95 backdrop-blur-md border-l border-white/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-eco-green" />
                <h2 className="text-xl font-bold text-white">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <span className="bg-eco-green text-white text-xs px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch(closeCartDrawer())}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green"></div>
                </div>
              ) : items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <Package className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start shopping to add items to your cart
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinueShopping}
                    className="px-6 py-3 bg-eco-green hover:bg-eco-leaf text-white font-semibold rounded-xl transition-colors"
                  >
                    Browse Products
                  </motion.button>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <CartItem
                        key={item.id || index}
                        item={item}
                        index={index}
                        onQuantityUpdate={handleQuantityUpdate}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Cart Summary & Checkout */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/20 p-6 space-y-4"
              >
                {/* Cart Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({totalItems} items):</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span className="text-eco-green">Free</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 flex justify-between text-lg font-bold text-white">
                    <span>Total:</span>
                    <span className="text-eco-green">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-eco-green/25 transition-all duration-300"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </motion.button>
                  
                  {/* View Full Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewFullCart}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Full Cart</span>
                  </motion.button>
                </div>

                {/* Continue Shopping Link */}
                <div className="text-center">
                  <button
                    onClick={handleContinueShopping}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;