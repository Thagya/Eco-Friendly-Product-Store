// src/components/products/ProductList.jsx
import React from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import ProductCard from "./productCard";

const ProductList = () => {
  const { filteredProducts, status } = useSelector((state) => state.products);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"
        />
        <span className="ml-3">Loading products...</span>
      </div>
    );
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Package className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-lg">No products found</p>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your filters or add your first product.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence>
        {filteredProducts.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductList;
