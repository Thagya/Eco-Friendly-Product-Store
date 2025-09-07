// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Filter,
  Eye,
  Save,
  X
} from 'lucide-react';

import { useProducts } from '../hooks/useProducts';
import Loading from '../components/common/Loading';
import ImageUpload from '../components/products/ImageUpload';

// Product Form Modal
const ProductModal = ({ isOpen, onClose, product = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'Eco Bags',
    image: product?.image || '',
    stock: product?.stock || 0,
  });

  const categories = ['Eco Bags', 'Water Bottles', 'Reusable Items', 'Solar Products', 'Organic'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Product Image
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(imageData) => setFormData(prev => ({ ...prev, image: imageData }))}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green"
              placeholder="Enter product description"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              <span>{product ? 'Update Product' : 'Add Product'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, trend, color = "eco-green" }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:border-eco-green/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="w-12 h-12 bg-eco-green/20 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-eco-green" />
        </div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      {trend && (
        <div className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  </motion.div>
);

// Product Row Component for Table
const ProductRow = ({ product, onEdit, onDelete, onView }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="border-b border-white/10 hover:bg-white/5 transition-colors"
  >
    <td className="px-6 py-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 rounded-lg flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="w-6 h-6 text-eco-green" />
          )}
        </div>
        <div>
          <div className="text-white font-medium">{product.name}</div>
          <div className="text-gray-400 text-sm">{product.category}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-white max-w-xs truncate">{product.description}</div>
    </td>
    <td className="px-6 py-4">
      <div className="text-eco-green font-semibold">${product.price}</div>
    </td>
    <td className="px-6 py-4">
      <div className={`text-sm ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
        {product.stock} units
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onView(product)}
          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(product)}
          className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(product._id)}
          className="p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </td>
  </motion.tr>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth.user) || { role: 'null' };
  const {
    products,
    isLoading,
    error,
    createProduct,
    modifyProduct,
    removeProduct,
    getProductStats,
  } = useProducts();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Filter products locally
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await modifyProduct(editingProduct._id, productData);
      } else {
        await createProduct(productData);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  // UPDATED: Pass product via state to ProductDetail
  const handleViewProduct = (product) => {
    navigate(`/products/${product._id}`, { state: { product } });
  };

  const stats = getProductStats();
  const categories = ['All', ...new Set(products.map(p => p.category))];

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading variant="pulse" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8"
        >
          <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Dashboard Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-eco-green hover:bg-eco-leaf text-white font-semibold rounded-xl transition-colors"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Admin <span className="text-eco-green">Dashboard</span>
            </h1>
            <p className="text-gray-400">Manage your eco-friendly product catalog</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddProduct}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-eco-green/25 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard icon={Package} title="Total Products" value={stats.total} />
          <StatsCard icon={DollarSign} title="Total Inventory Value" value={`$${stats.totalValue.toFixed(2)}`} />
          <StatsCard icon={TrendingUp} title="Low Stock Items" value={stats.lowStock} />
          <StatsCard icon={Users} title="Categories" value={stats.categories} />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto bg-white/5 rounded-2xl border border-white/10"
        >
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <AnimatePresence>
                {filteredProducts.map(product => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Dashboard;
