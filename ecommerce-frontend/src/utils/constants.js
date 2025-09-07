// src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'All',
  'Eco Bags',
  'Water Bottles',
  'Reusable Items',
  'Solar Products',
  'Organic',
  'Bamboo Products',
  'Recycled Materials'
];

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Cart Constants
export const CART_CONFIG = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
  AUTO_CLOSE_DRAWER_DELAY: 3000,
  FREE_SHIPPING_THRESHOLD: 50,
  TAX_RATE: 0.08
};

// Product Constants
export const PRODUCT_CONFIG = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
  LOW_STOCK_THRESHOLD: 10,
  OUT_OF_STOCK_THRESHOLD: 0
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50
};

// Sort Options
export const SORT_OPTIONS = {
  NAME_ASC: { value: 'name', order: 'asc', label: 'Name (A-Z)' },
  NAME_DESC: { value: 'name', order: 'desc', label: 'Name (Z-A)' },
  PRICE_ASC: { value: 'price', order: 'asc', label: 'Price (Low to High)' },
  PRICE_DESC: { value: 'price', order: 'desc', label: 'Price (High to Low)' },
  NEWEST: { value: 'createdAt', order: 'desc', label: 'Newest First' },
  OLDEST: { value: 'createdAt', order: 'asc', label: 'Oldest First' }
};

// Animation Durations (in seconds)
export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.6,
  VERY_SLOW: 1.0
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Color Palette
export const COLORS = {
  ECO_GREEN: '#10b981',
  ECO_LEAF: '#059669',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  ROLE: 'role',
  CART_ID: 'cartId',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CART_ERROR: 'Failed to update cart. Please try again.',
  PRODUCT_ERROR: 'Failed to load product. Please try again.',
  LOGIN_ERROR: 'Invalid credentials. Please try again.',
  REGISTRATION_ERROR: 'Registration failed. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PRODUCT_ADDED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  CART_UPDATED: 'Cart updated successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart!'
};

// Feature Flags
export const FEATURES = {
  ENABLE_3D: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_SOUND: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PWA: false
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com',
  TWITTER: 'https://twitter.com',
  INSTAGRAM: 'https://instagram.com',
  LINKEDIN: 'https://linkedin.com'
};

// SEO Meta
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'EcoStore - Sustainable Products for a Better Future',
  DEFAULT_DESCRIPTION: 'Discover our collection of eco-friendly products. Shop sustainable, environmentally conscious items that help protect our planet.',
  KEYWORDS: 'eco-friendly, sustainable, green products, environment, organic, recycled',
  SITE_NAME: 'EcoStore',
  TWITTER_HANDLE: '@ecostore'
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'contact@ecostore.com',
  PHONE: '+1 (555) 123-4567',
  ADDRESS: '123 Green Street, Eco City, EC 12345',
  SUPPORT_HOURS: 'Monday - Friday, 9:00 AM - 6:00 PM EST'
};