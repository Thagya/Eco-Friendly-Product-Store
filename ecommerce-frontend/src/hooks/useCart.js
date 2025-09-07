// src/hooks/useCart.js
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from './useAuth';
import { 
  createCart, 
  fetchCart, 
  addToCart as addToCartAction,
  updateCartItem,
  removeFromCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  setCartError
} from '../store/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isSessionValid } = useAuth();
  const cart = useSelector((state) => state.cart);

  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // -------------------------------
  // CART OPERATIONS
  // -------------------------------
  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !isSessionValid) return;
    try {
      await dispatch(fetchCart(cart.cartId)).unwrap();
      setLastSync(Date.now());
    } catch (error) {
      dispatch(setCartError('Failed to load cart.'));
    }
  }, [dispatch, isAuthenticated, isSessionValid, cart.cartId]);

  const addToCart = useCallback(async (productData) => {
    if (!isAuthenticated || !isSessionValid) throw new Error('Please login to add items');
    if (!productData.productId || productData.quantity < 1) throw new Error('Invalid product data');

    try {
      setIsUpdating(true);
      const cartId = cart.cartId || (await dispatch(createCart()).unwrap()).cartId;
      await dispatch(addToCartAction({ cartId, ...productData })).unwrap();
      dispatch(openCartDrawer());
      setTimeout(() => { if (cart.isDrawerOpen) dispatch(closeCartDrawer()); }, 3000);
    } catch (error) {
      dispatch(setCartError(error.message || 'Failed to add item'));
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, isAuthenticated, isSessionValid, cart.cartId, cart.isDrawerOpen]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated || !isSessionValid) throw new Error('Please login to update cart');
    if (quantity < 1) throw new Error('Quantity must be at least 1');

    await dispatch(updateCartItem({ itemId, quantity })).unwrap();
    if (cart.cartId) dispatch(fetchCart(cart.cartId));
  }, [dispatch, isAuthenticated, isSessionValid, cart.cartId]);

  const removeItem = useCallback(async (itemId) => {
    if (!isAuthenticated || !isSessionValid) throw new Error('Please login to remove items');
    await dispatch(removeFromCart(itemId)).unwrap();
    if (cart.cartId) dispatch(fetchCart(cart.cartId));
  }, [dispatch, isAuthenticated, isSessionValid, cart.cartId]);

  const clearCartSafe = useCallback(async (confirm = false) => {
    if (!confirm) throw new Error('Confirmation required to clear cart');
    await dispatch(createCart()).unwrap();
  }, [dispatch]);

  // -------------------------------
  // UTILITY FUNCTIONS
  // -------------------------------
  const getCartTotal = useCallback(() => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart.items]);
  const getCartItemCount = useCallback(() => cart.items.reduce((sum, item) => sum + item.quantity, 0), [cart.items]);
  const isInCart = useCallback(productId => cart.items.some(item => item.productId === productId), [cart.items]);
  const getCartItemQuantity = useCallback(productId => {
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }, [cart.items]);

  const toggleDrawer = () => dispatch(toggleCartDrawer());
  const openDrawer = () => dispatch(openCartDrawer());
  const closeDrawer = () => dispatch(closeCartDrawer());

  // -------------------------------
  // EFFECTS
  // -------------------------------
  useEffect(() => {
    if (isAuthenticated && !cart.cartId) dispatch(createCart());
  }, [isAuthenticated, cart.cartId, dispatch]);

  useEffect(() => {
    if (cart.cartId && isAuthenticated) dispatch(fetchCart(cart.cartId));
  }, [cart.cartId, isAuthenticated, dispatch]);

  return {
    cartId: cart.cartId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    isLoading: cart.isLoading || isUpdating,
    error: cart.error,
    isDrawerOpen: cart.isDrawerOpen,

    addToCart,
    updateQuantity,
    removeItem,
    clearCart: clearCartSafe,

    toggleDrawer,
    openDrawer,
    closeDrawer,

    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItemQuantity,

    lastSync
  };
};
