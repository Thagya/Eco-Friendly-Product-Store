// src/components/products/ProductDetail.jsx
import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { products } = useSelector((state) => state.products);

  // ✅ Use location.state first, fallback to Redux products
  const product = location.state?.product || products.find((p) => p._id === id);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
      >
        <div className="flex items-center justify-center bg-gray-800 rounded-xl overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-20 h-20 text-eco-green" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
          <p className="text-gray-300 mb-4">{product.description}</p>
          <p className="text-eco-green text-2xl font-semibold mb-4">${product.price}</p>
          <span className={`inline-block px-3 py-1 rounded-full ${
            product.stock > 10
              ? "bg-green-500/20 text-green-400"
              : product.stock > 0
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetail;
