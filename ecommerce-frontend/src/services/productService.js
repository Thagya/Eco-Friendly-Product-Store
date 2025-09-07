// src/services/productService.js
import api from './api';
import { authService } from './authService';

const getAuthHeaders = (token) => {
  if (!token) throw new Error('Admin access required');
  return { Authorization: `Bearer ${token}` };
};

export const productService = {
  // ==============================
  // PUBLIC ROUTES
  // ==============================
  getProducts: async () => (await api.get('/products')).data,
  getProductById: async (id) => (await api.get(`/products/${id}`)).data,
  searchProducts: async (query) => (await api.get(`/products/search?q=${encodeURIComponent(query)}`)).data,
  getProductsByCategory: async (category) => (await api.get(`/products/category/${category}`)).data,

  // ==============================
  // ADMIN ONLY ROUTES (JWT REQUIRED)
  // ==============================
  addProduct: async (data, token) => {
    const headers = getAuthHeaders(token);
    return (await api.post('/products', data, { headers })).data;
  },

  updateProduct: async (id, data, token) => {
    const headers = getAuthHeaders(token);
    return (await api.put(`/products/${id}`, data, { headers })).data;
  },

  deleteProduct: async (id, token) => {
    const headers = getAuthHeaders(token);
    return (await api.delete(`/products/${id}`, { headers })).data;
  },

  uploadImage: async (file, token) => {
    const headers = { ...getAuthHeaders(token), 'Content-Type': 'multipart/form-data' };
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post('/products/upload', formData, { headers })).data;
  },
};
