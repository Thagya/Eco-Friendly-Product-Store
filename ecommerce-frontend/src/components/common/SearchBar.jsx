// src/components/common/SearchBar.jsx (Fixed)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { setSearchTerm } from '../../store/productsSlice';

const SearchBar = ({ onClose, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  const { searchTerm = '', filteredProducts = [], products = [] } = useSelector((state) => state.products || {});

  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedTerm = localSearchTerm.trim();
    
    try {
      dispatch(setSearchTerm(trimmedTerm));
      
      if (trimmedTerm) {
        navigate('/products');
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    dispatch(setSearchTerm(''));
  };

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  // Get top suggestions safely
  const suggestions = React.useMemo(() => {
    if (!localSearchTerm || localSearchTerm.length < 2) return [];
    
    // Use products array if filteredProducts is empty
    const sourceProducts = filteredProducts.length > 0 ? filteredProducts : products;
    
    if (!sourceProducts || sourceProducts.length === 0) return [];
    
    const searchLower = localSearchTerm.toLowerCase();
    return sourceProducts
      .filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
      .slice(0, 5);
  }, [localSearchTerm, filteredProducts, products]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={handleInputChange}
            placeholder="Search eco-friendly products..."
            className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent transition-all duration-300"
            autoFocus
          />
          {localSearchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {localSearchTerm && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl z-50"
        >
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 uppercase tracking-wide">
              Suggestions
            </div>
            {suggestions.map((product) => (
              <motion.button
                key={product._id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={() => {
                  navigate(`/products/${product._id}`);
                  if (onClose) onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-eco-green to-eco-leaf rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {product.description}
                  </div>
                </div>
                <div className="text-sm font-bold text-eco-green">
                  ${product.price}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>  
      )}
    </div>
  );
}

export default SearchBar;