// src/components/common/CategoryFilter.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCategory } from '../../store/productsSlice';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Package, Sun, Recycle } from 'lucide-react';

const categories = [
  { label: 'All', value: 'All', icon: Package },
  { label: 'Eco Bags', value: 'Eco Bags', icon: Leaf },
  { label: 'Water Bottles', value: 'Water Bottles', icon: Droplets },
  { label: 'Reusable Items', value: 'Reusable Items', icon: Recycle },
  { label: 'Solar Products', value: 'Solar Products', icon: Sun },
  { label: 'Organic', value: 'Organic', icon: Leaf },
];

const CategoryFilter = () => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.products);

  const handleCategoryClick = (value) => {
    dispatch(setSelectedCategory(value));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {categories.map(({ label, value, icon: Icon }) => (
        <motion.button
          key={value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick(value)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === value
              ? 'bg-eco-green text-white shadow-md'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
