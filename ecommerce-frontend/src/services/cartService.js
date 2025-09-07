import api from './api';

export const cartService = {
  createCart: async () => (await api.post('/cart')).data,

  getCart: async (cartId) => {
    if (!cartId) throw { name: 'ValidationError', details: 'Cart ID is required' };
    return (await api.get(`/cart?cartId=${cartId}`)).data;
  },

  addToCart: async (cartId, productId, quantity = 1) => {
    if (!cartId || !productId) throw { name: 'ValidationError', details: 'Cart ID and Product ID are required' };
    if (quantity < 1) quantity = 1;

    return (await api.post('/cart/items', { cartId, productId, quantity })).data;
  },

  updateCartItem: async (itemId, quantity) => {
    if (!itemId) throw { name: 'ValidationError', details: 'Item ID is required' };
    if (quantity < 1) quantity = 1;

    return (await api.put(`/cart/items/${itemId}`, { quantity })).data;
  },

  removeFromCart: async (itemId) => {
    if (!itemId) throw { name: 'ValidationError', details: 'Item ID is required' };
    return (await api.delete(`/cart/items/${itemId}`)).data;
  },

  clearCart: async (cartId) => {
    if (!cartId) throw { name: 'ValidationError', details: 'Cart ID is required' };
    return (await api.delete(`/cart/${cartId}`)).data;
  },

  getCartCount: async (cartId) => {
    if (!cartId) return 0;
    try {
      const items = await cartService.getCart(cartId);
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch {
      return 0;
    }
  },
};
