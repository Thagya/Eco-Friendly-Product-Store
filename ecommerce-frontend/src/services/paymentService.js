import api from './api';

export const paymentService = {
  createCheckoutSession: async (cartId) => {
    const response = await api.post('/payments/create-checkout-session', { cartId });
    if (!response.data.success) throw new Error(response.data.error || 'Checkout failed');
    return response.data;
  },

  processBuyNow: async (productId, quantity = 1) => {
    const response = await api.post('/payments/buy-now', { productId, quantity });
    if (!response.data.success) throw new Error(response.data.error || 'Buy now failed');
    return response.data;
  },

  handlePaymentSuccess: async (sessionId) => {
    return (await api.post('/payments/success', { sessionId })).data;
  },

  getPaymentHistory: async () => (await api.get('/payments/history')).data,

  testStripeConnection: async () => (await api.get('/payments/test-stripe')).data,

  verifyPayment: async (sessionId) => (await api.get(`/payments/verify/${sessionId}`)).data,

  cancelPayment: async (sessionId) => (await api.post(`/payments/cancel/${sessionId}`)).data
};
