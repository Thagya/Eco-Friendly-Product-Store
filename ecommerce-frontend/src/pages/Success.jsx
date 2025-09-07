// src/pages/Success.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { resetCart } from "../store/cartSlice";

const Success = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        setError('No payment session found');
        setIsProcessing(false);
        return;
      }

      try {
        // Call backend to handle payment success and update stock
        const response = await paymentService.handlePaymentSuccess(sessionId);
        
        setOrderDetails({
          sessionId: response.sessionId,
          orderId: response.orderId || 'ECO-' + Date.now(),
          message: response.message
        });

        // Clear the cart after successful payment
        dispatch(resetCart());

        setIsProcessing(false);
      } catch (error) {
        console.error('Payment success handling error:', error);
        setError('Failed to process payment success');
        setIsProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId, dispatch]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 border-4 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Processing Your Order</h2>
          <p className="text-gray-300 mb-4">Please wait while we confirm your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-red-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-md mx-4"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Payment Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/cart")}
              className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Back to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/products")}
              className="flex-1 px-6 py-3 bg-eco-green hover:bg-eco-leaf text-white font-semibold rounded-xl transition-colors"
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-lg mx-4"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Thank you for your purchase! Your order has been confirmed and is being processed.
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-2">Order Details:</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p><span className="text-gray-400">Order ID:</span> {orderDetails.orderId}</p>
                <p><span className="text-gray-400">Payment ID:</span> {orderDetails.sessionId}</p>
                <p><span className="text-gray-400">Status:</span> <span className="text-green-400">Confirmed</span></p>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 text-left">
            <h4 className="text-blue-400 font-semibold mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• Your order will be processed within 24 hours</li>
              <li>• Tracking information will be sent via email</li>
              <li>• Estimated delivery: 3-5 business days</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/products")}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Back to Home
            </motion.button>
          </div>

          {/* Thank you note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-400 text-sm mt-6"
          >
            Thank you for choosing our eco-friendly products! 🌱
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Success;