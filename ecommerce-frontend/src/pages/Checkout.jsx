// src/pages/Checkout.jsx - DEBUG ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Check,
  Shield,
  Package,
  AlertCircle
} from 'lucide-react';
import { fetchCart } from '../store/cartSlice';
import { paymentService } from '../services/paymentService';
import Loading from '../components/common/Loading';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items, totalItems, totalPrice, cartId, isLoading } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka'
  });
  
  const [errors, setErrors] = useState({});

  // Debug effect
  useEffect(() => {
    const info = `
Debug Info:
- Authenticated: ${isAuthenticated}
- User: ${user?.username || 'None'}
- Cart ID: ${cartId || 'None'}
- Items: ${items?.length || 0}
- Total: $${totalPrice || 0}
- Loading: ${isLoading}
    `.trim();
    setDebugInfo(info);
    console.log(info);
  }, [isAuthenticated, user, cartId, items, totalPrice, isLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting...');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart data
  useEffect(() => {
    if (cartId && isAuthenticated) {
      console.log('Fetching cart data...');
      dispatch(fetchCart(cartId));
    }
  }, [dispatch, cartId, isAuthenticated]);

  // Calculate totals
  const shipping = 0;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  // --- VALIDATION FUNCTION ---
const validateBillingInfo = () => {
  const newErrors = {};

  if (!billingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!billingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!billingInfo.email.trim()) {
    newErrors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }
  }
  if (!billingInfo.phone.trim()) {
    newErrors.phone = 'Phone is required';
  } else {
    const phoneRegex = /^[0-9]{9,15}$/; // simple phone validation
    if (!phoneRegex.test(billingInfo.phone)) {
      newErrors.phone = 'Phone must be 9–15 digits';
    }
  }
  if (!billingInfo.address.trim()) newErrors.address = 'Address is required';
  if (!billingInfo.city.trim()) newErrors.city = 'City is required';
  if (!billingInfo.zipCode.trim()) {
    newErrors.zipCode = 'ZIP code is required';
  } else {
    const zipRegex = /^[0-9]{4,10}$/;
    if (!zipRegex.test(billingInfo.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// --- HANDLE CHANGES WITH LIVE VALIDATION ---
const handleBillingInfoChange = (field, value) => {
  setBillingInfo((prev) => ({ ...prev, [field]: value }));

  // re-validate only that field
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }
};

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateBillingInfo()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const testStripeConnection = async () => {
    try {
      console.log('Testing Stripe connection...');
      const result = await paymentService.testStripeConnection();
      console.log('Stripe test result:', result);
      alert(`Stripe Test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.message}`);
    } catch (error) {
      console.error('Stripe test failed:', error);
      alert(`Stripe Test FAILED: ${error.message}`);
    }
  };

  const processPayment = async () => {
    console.log('=== Starting Payment Process ===');
    console.log('Cart ID:', cartId);
    console.log('Items count:', items?.length);
    console.log('Total amount:', finalTotal);

    // Validation checks
    if (!cartId) {
      const errorMsg = 'Cart ID not found. Please refresh and try again.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!items || items.length === 0) {
      const errorMsg = 'Your cart is empty. Please add items before checkout.';
      console.error(errorMsg);
      setError(errorMsg);
      setTimeout(() => navigate('/cart'), 2000);
      return;
    }

    if (!isAuthenticated) {
      const errorMsg = 'Please login to continue with payment.';
      console.error(errorMsg);
      setError(errorMsg);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessingMessage('Validating cart...');

    try {
      // Step 1: Validate cart
      console.log('Step 1: Validating cart...');
      setProcessingMessage('Creating secure checkout session...');

      // Step 2: Create checkout session
      console.log('Step 2: Creating checkout session...');
      const response = await paymentService.createCheckoutSession(cartId);
      
      console.log('Checkout session response:', response);

      if (!response) {
        throw new Error('No response from payment service');
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to create checkout session');
      }

      if (!response.url) {
        throw new Error('No checkout URL received from server');
      }

      // Step 3: Redirect to Stripe
      console.log('Step 3: Redirecting to Stripe checkout...');
      console.log('Stripe URL:', response.url);
      
      setProcessingMessage('Redirecting to secure payment page...');
      
      // Show any warnings about stock adjustments
      if (response.issues && response.issues.length > 0) {
        console.warn('Stock issues:', response.issues);
        // You might want to show these to the user
      }

      // Small delay to show the message
      setTimeout(() => {
        console.log('Redirecting to:', response.url);
        window.location.href = response.url;
      }, 1000);

    } catch (error) {
      console.error('=== Payment Process Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      setIsProcessing(false);
      setProcessingMessage('');
      
      let errorMessage = 'Payment processing failed. ';
      
      if (error.message.includes('Cart is empty')) {
        errorMessage += 'Your cart is empty.';
        setTimeout(() => navigate('/cart'), 3000);
      } else if (error.message.includes('not authenticated') || error.message.includes('login')) {
        errorMessage += 'Please login to continue.';
        setTimeout(() => navigate('/login'), 3000);
      } else if (error.message.includes('Stripe')) {
        errorMessage += 'Payment system error. Please try again.';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  const steps = [
    { number: 1, title: 'Billing Info', icon: Package },
    { number: 2, title: 'Review & Pay', icon: CreditCard }
  ];

  if (!isAuthenticated) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-eco-green hover:bg-eco-leaf text-white font-semibold rounded-xl transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 border-4 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Processing Payment</h2>
          <p className="text-gray-300 mb-4">{processingMessage}</p>
          <p className="text-sm text-gray-400">Please wait while we securely process your payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </motion.button>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Secure <span className="text-green-400">Checkout</span>
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={testStripeConnection}
              className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded"
              title="Test Stripe Connection"
            >
              Test Stripe
            </button>
          </div>
        </motion.div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
          >
            <h3 className="text-yellow-400 font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs text-yellow-300 whitespace-pre-wrap">{debugInfo}</pre>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Payment Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-green-500 text-white' :
                    isCompleted ? 'bg-green-500/20 text-green-400' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-colors duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Billing Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Billing Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={billingInfo.firstName}
                      onChange={(e) => handleBillingInfoChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.firstName ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={billingInfo.lastName}
                      onChange={(e) => handleBillingInfoChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.lastName ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.email ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={billingInfo.phone}
                      onChange={(e) => handleBillingInfoChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.phone ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">Address *</label>
                    <input
                      type="text"
                      value={billingInfo.address}
                      onChange={(e) => handleBillingInfoChange('address', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.address ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      value={billingInfo.city}
                      onChange={(e) => handleBillingInfoChange('city', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.city ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={billingInfo.zipCode}
                      onChange={(e) => handleBillingInfoChange('zipCode', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.zipCode ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Continue to Review
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review & Pay */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  {/* Billing Info Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Billing Information</h3>
                    <div className="bg-white/5 rounded-lg p-4 text-gray-300">
                      <p>{billingInfo.firstName} {billingInfo.lastName}</p>
                      <p>{billingInfo.email}</p>
                      <p>{billingInfo.phone}</p>
                      <p>{billingInfo.address}</p>
                      <p>{billingInfo.city}, {billingInfo.zipCode}</p>
                      <p>{billingInfo.country}</p>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-eco-green/20 rounded-lg flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-eco-green" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-eco-green font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Notice */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Secure Payment</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      You'll be redirected to Stripe's secure payment page to complete your purchase.
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrevStep}
                    className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Pay ${finalTotal.toFixed(2)}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-eco-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-eco-green" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-eco-green font-semibold text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/20 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({totalItems} items):</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span className="text-eco-green">Free</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between text-lg font-bold text-white">
                  <span>Total:</span>
                  <span className="text-eco-green">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Shield className="w-4 h-4 text-eco-green" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;