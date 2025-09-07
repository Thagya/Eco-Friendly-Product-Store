import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import { fetchProducts, fetchProductById, addProduct, updateProduct, deleteProduct } from '../store/productsSlice';

export const useProducts = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { products, filteredProducts, currentProduct, categories, selectedCategory, searchTerm, isLoading, error } = useSelector(state => state.products);

  const loadProducts = useCallback(() => dispatch(fetchProducts()).unwrap(), [dispatch]);
  const getProductById = useCallback((id) => products.find(p => p._id === id), [products]);

  const createProduct = useCallback(
    async (data) => {
      if (!isAdmin()) throw new Error('Admin access required');
      return dispatch(addProduct(data)).unwrap();
    },
    [dispatch, isAdmin]
  );

  const modifyProduct = useCallback(
    async (id, data) => {
      if (!isAdmin()) throw new Error('Admin access required');
      return dispatch(updateProduct({ id, data })).unwrap();
    },
    [dispatch, isAdmin]
  );

  const removeProduct = useCallback(
    async (id) => {
      if (!isAdmin()) throw new Error('Admin access required');
      return dispatch(deleteProduct(id)).unwrap();
    },
    [dispatch, isAdmin]
  );
  const getProductStats = useCallback(() => {
  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 10 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;
  const avgPrice = total > 0 ? products.reduce((sum, p) => sum + p.price, 0) / total : 0;
  return {
    total,
    totalValue,
    lowStock,
    outOfStock,
    categoriesCount,
    avgPrice: Math.round(avgPrice * 100) / 100
  };
}, [products]);


  return {
    products,
    filteredProducts,
    currentProduct,
    categories,
    selectedCategory,
    searchTerm,
    isLoading,
    error,
    loadProducts,
    getProductById,
    createProduct,
    modifyProduct,
    removeProduct,
    getProductStats
  };
};
