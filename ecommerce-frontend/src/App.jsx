// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import Loading from './components/common/Loading';
import ParticleBackground from './components/3d/PracticalBackground';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';

// Store actions
import { fetchProducts } from './store/productsSlice';
import { createCart, fetchCart } from './store/cartSlice';

// Hooks
import { useAuth } from './hooks/useAuth';

// Styles
import './styles/globals.css';

// Protected Route Component
// src/App.jsx
// src/App.jsx
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>; // wait for user data

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return children;
};


// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

// Animated Route Wrapper
const AnimatedRoute = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isLoading: productsLoading } = useSelector((state) => state.products);
  const { isLoading: authLoading } = useSelector((state) => state.auth);

  // Initialize application data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(fetchProducts());
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    initializeApp();
  }, [dispatch]);

  // Initialize cart for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const savedCartId = localStorage.getItem('cartId');
      if (savedCartId) {
        dispatch(fetchCart(savedCartId));
      } else {
        dispatch(createCart());
      }
    }
  }, [dispatch, isAuthenticated]);

  const isAppLoading = productsLoading || authLoading;

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main Content */}
        <main className="flex-grow pt-16 md:pt-20">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <AnimatedRoute>
                    <Home />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <AnimatedRoute>
                    <Products />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <AnimatedRoute>
                    <ProductDetail />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <AnimatedRoute>
                    <Login />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <AnimatedRoute>
                    <Register />
                  </AnimatedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <Cart />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <Checkout />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/success"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <Success />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AnimatedRoute>
                      <Dashboard />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isAppLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <Loading variant="pulse" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-gray-300 text-sm"
              >
                Loading your eco-friendly experience...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
