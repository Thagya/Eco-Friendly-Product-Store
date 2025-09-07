// src/components/cart/CartSummary.jsx - FIXED VERSION
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard } from "lucide-react";

const CartSummary = ({ subtotal, taxRate = 0.08, shipping = "Free", onCheckout, onContinue }) => {
  const navigate = useNavigate();
  
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onCheckout) {
      onCheckout();
    } else {
      // Direct navigation to checkout
      navigate('/checkout');
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onContinue) {
      onContinue();
    } else {
      // Direct navigation to products
      navigate('/products');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-white/10 p-6 bg-black/20"
    >
      {/* Order Summary */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Shipping</span>
          <span className="text-eco-green">{shipping}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <hr className="border-white/10" />
        <div className="flex justify-between text-xl font-bold text-white">
          <span>Total</span>
          <span className="text-eco-green">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheckout}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
        >
          <CreditCard className="w-5 h-5" />
          <span>Checkout</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300"
        >
          Continue Shopping
        </motion.button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-400">
        <div className="w-4 h-4 bg-eco-green/20 rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-eco-green rounded" />
        </div>
        <span>Secure checkout powered by SSL</span>
      </div>
    </motion.div>
  );
};

export default CartSummary;