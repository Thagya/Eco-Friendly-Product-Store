// src/components/cart/CartItem.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

const CartItem = ({ item, index, onQuantityUpdate, onRemove }) => {
  const [imageError, setImageError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onQuantityUpdate(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:border-eco-green/30 transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex-shrink-0">
          {item.image && !imageError ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-eco-green" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">
            {item.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-eco-green font-semibold">
              ${item.price}
            </span>
            <span className="text-gray-400 text-sm">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity Controls and Remove */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-300" />
          </motion.button>

          <span className="text-white font-semibold min-w-[2rem] text-center">
            {item.quantity}
          </span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-300" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
};

export default CartItem;