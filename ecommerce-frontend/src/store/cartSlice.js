// src/store/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services/cartService';

// ============================
// ASYNC THUNKS
// ============================
export const createCart = createAsyncThunk(
  'cart/createCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.isAuthenticated) throw new Error('User must be authenticated');
      const response = await cartService.createCart();
      localStorage.setItem('cartId', response.cartId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (cartId, { rejectWithValue }) => {
    try {
      const id = cartId || localStorage.getItem('cartId');
      if (!id) return [];
      const response = await cartService.getCart(id);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ cartId, productId, quantity = 1 }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.isAuthenticated) throw new Error('User must be authenticated');

      let currentCartId = cartId || localStorage.getItem('cartId');
      if (!currentCartId) {
        const cartResult = await dispatch(createCart()).unwrap();
        currentCartId = cartResult.cartId;
      }

      const response = await cartService.addToCart(currentCartId, productId, quantity);
      dispatch(fetchCart(currentCartId));
      return { productId, quantity, cartId: currentCartId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      const { cart } = getState();
      if (cart.cartId) dispatch(fetchCart(cart.cartId));
      return { itemId, quantity, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { getState, dispatch, rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId);
      const { cart } = getState();
      if (cart.cartId) dispatch(fetchCart(cart.cartId));
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      if (cart.cartId) await cartService.clearCart(cart.cartId);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ============================
// INITIAL STATE
// ============================
const initialState = {
  cartId: localStorage.getItem('cartId'),
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  isDrawerOpen: false,
};

// Helper: calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  return { totalItems, totalPrice };
};

// ============================
// SLICE
// ============================
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state) => { state.isDrawerOpen = !state.isDrawerOpen; },
    openCartDrawer: (state) => { state.isDrawerOpen = true; },
    closeCartDrawer: (state) => { state.isDrawerOpen = false; },
    resetCart: (state) => {
      state.cartId = null;
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.error = null;
      localStorage.removeItem('cartId');
    },
    updateTotals: (state) => {
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    clearError: (state) => { state.error = null; },
    setCartError: (state, action) => { state.error = action.payload; }, // ✅ Added
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => { state.isLoading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => { state.isLoading = false; state.error = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.error = null;

          if (Array.isArray(action.payload)) {
            state.items = action.payload;
            const totals = calculateTotals(state.items);
            state.totalItems = totals.totalItems;
            state.totalPrice = totals.totalPrice;
          }

          if (action.type === clearCart.fulfilled.type) {
            state.items = [];
            state.totalItems = 0;
            state.totalPrice = 0;
          }

          if (action.payload?.cartId) state.cartId = action.payload.cartId;
        }
      );
  },
});

// ============================
// EXPORTS
// ============================
export const { toggleCartDrawer, openCartDrawer, closeCartDrawer, resetCart, updateTotals, clearError, setCartError } = cartSlice.actions;
export default cartSlice.reducer;
