// src/services/api.js - JWT Only + Helpers
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// -----------------------------
// Helper methods
// -----------------------------
api.getProducts = () => api.get('/products');          // fetch all products
api.getProductById = (id) => api.get(`/products/${id}`); // fetch single product
api.createOrder = (orderData) => api.post('/orders', orderData); // for checkout
api.getCart = (cartId) => api.get(`/cart/${cartId}`);
api.createCart = () => api.post('/cart');

// Add more helpers here as needed...

export default api;
