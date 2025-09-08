// src/services/paymentService.js
import api from './api';

export const paymentService = {
  // Create Stripe Checkout session for cart
  createCheckoutSession: async (cartId) => {
    const response = await api.post('/payments/create-checkout-session', { cartId });
    if (!response.data.success) throw new Error(response.data.error || 'Checkout failed');
    return response.data;
  },

  // Buy now flow for single product
  processBuyNow: async (productId, quantity = 1) => {
    const response = await api.post('/payments/buy-now', { productId, quantity });
    if (!response.data.success) throw new Error(response.data.error || 'Buy now failed');
    return response.data;
  },

  // ✅ FIXED: Stripe redirect confirmation
  // Use existing backend route `/payments/verify/:sessionId`
  handlePaymentSuccess: async (sessionId) => {
  // Change '/payments/verify' → '/payments/success'
  const response = await api.post('/payments/success', { sessionId });
  return response.data;
},

  // Payment history for logged-in user
  getPaymentHistory: async () => (await api.get('/payments/history')).data,

  // Check Stripe connection
  testStripeConnection: async () => (await api.get('/payments/test-stripe')).data,

  // Verify payment session manually
  verifyPayment: async (sessionId) => (await api.get(`/payments/verify/${sessionId}`)).data,

  // Cancel a payment session
  cancelPayment: async (sessionId) => (await api.post(`/payments/cancel/${sessionId}`)).data
};
