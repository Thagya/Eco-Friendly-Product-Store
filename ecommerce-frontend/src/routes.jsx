// src/routes.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Components
import Loading from "./components/common/Loading";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Route protection
const ProtectedRoute = ({ children, adminOnly = false, guestOnly = false }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (guestOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public wrapper
const PublicRoute = ({ children }) => children;

// Suspense wrapper
const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    }
  >
    {children}
  </Suspense>
);

// Route configuration
const routeConfig = [
  { path: "/", element: Home, protected: false, adminOnly: false, guestOnly: false, title: "Home" },
  { path: "/products", element: Products, protected: false, adminOnly: false, guestOnly: false, title: "Products" },
  { path: "/products/:id", element: ProductDetail, protected: false, adminOnly: false, guestOnly: false, title: "Product Detail" },
  { path: "/cart", element: Cart, protected: true, adminOnly: false, guestOnly: false, title: "Cart" },
  { path: "/checkout", element: Checkout, protected: true, adminOnly: false, guestOnly: false, title: "Checkout" },
  { path: "/success", element: Success, protected: true, adminOnly: false, guestOnly: false, title: "Payment Success" },
  { path: "/login", element: Login, protected: false, adminOnly: false, guestOnly: true, title: "Login" },
  { path: "/register", element: Register, protected: false, adminOnly: false, guestOnly: true, title: "Register" },
  { path: "/dashboard", element: Dashboard, protected: true, adminOnly: true, guestOnly: false, title: "Dashboard" },
];

// Generate routes
const generateRoutes = () =>
  routeConfig.map((route) => {
    const { path, element: Component, protected: isProtected, adminOnly, guestOnly } = route;

    let routeElement = (
      <SuspenseWrapper>
        <Component />
      </SuspenseWrapper>
    );

    if (isProtected || adminOnly || guestOnly) {
      routeElement = (
        <ProtectedRoute adminOnly={adminOnly} guestOnly={guestOnly}>
          {routeElement}
        </ProtectedRoute>
      );
    } else {
      routeElement = <PublicRoute>{routeElement}</PublicRoute>;
    }

    return <Route key={path} path={path} element={routeElement} />;
  });

// Main AppRoutes
const AppRoutes = () => (
  <Routes>
    {generateRoutes()}
    <Route
      path="*"
      element={
        <SuspenseWrapper>
          <NotFound />
        </SuspenseWrapper>
      }
    />
  </Routes>
);

// NotFound page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-glow">
          <span className="text-6xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => window.history.back()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl"
        >
          Go Back
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

export { ProtectedRoute, PublicRoute, SuspenseWrapper, NotFound, routeConfig };
export default AppRoutes;
