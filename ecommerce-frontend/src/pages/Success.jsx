// src/pages/Success.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Package,
  AlertCircle,
  Clock,
} from "lucide-react";
import { paymentService } from "../services/paymentService";
import { resetCart } from "../store/cartSlice";

const Success = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const handlePaymentSuccess = async (attempt = 1) => {
      if (!sessionId) {
        setError("No payment session found. Please check your payment status.");
        setIsProcessing(false);
        return;
      }

      try {
        console.log(`Processing payment success - Attempt ${attempt}`);
        console.log("Session ID:", sessionId);

        // ✅ Call backend verify route
        const response = await paymentService.handlePaymentSuccess(sessionId);

        console.log("Payment success response:", response);

        if (response.success) {
          setOrderDetails({
            sessionId: response.sessionId || sessionId,
            orderId: response.orderId || "ECO-" + Date.now(),
            message: response.message || "Payment processed successfully",
            amount: response.amount,
            items: response.items,
          });

          // Clear the cart after successful payment
          dispatch(resetCart());

          setIsProcessing(false);
          console.log("Payment success processed successfully");
        } else {
          throw new Error(response.error || "Payment verification failed");
        }
      } catch (error) {
        console.error(
          `Payment success handling error (attempt ${attempt}):`,
          error
        );

        // Retry logic for network issues
        if (
          attempt < 3 &&
          (error.message.includes("network") ||
            error.message.includes("timeout"))
        ) {
          console.log(
            `Retrying payment verification... Attempt ${attempt + 1}`
          );
          setRetryCount(attempt);
          setTimeout(() => {
            handlePaymentSuccess(attempt + 1);
          }, 2000 * attempt); // Progressive delay
        } else {
          // Final error handling
          let errorMessage =
            "We encountered an issue while confirming your payment. ";

          if (error.message.includes("already processed")) {
            errorMessage =
              "This payment has already been processed. Your order is confirmed.";
            // Still clear cart and show success
            dispatch(resetCart());
            setOrderDetails({
              sessionId: sessionId,
              orderId: "ECO-" + Date.now(),
              message: "Payment already confirmed",
            });
            setIsProcessing(false);
            return;
          } else if (error.message.includes("session not found")) {
            errorMessage +=
              "Payment session expired. Please contact support if payment was deducted.";
          } else if (error.message.includes("network")) {
            errorMessage +=
              "Network connection issue. Your payment may have been successful.";
          } else {
            errorMessage += "Please contact support with your payment details.";
          }

          setError(errorMessage);
          setIsProcessing(false);
        }
      }
    };

    handlePaymentSuccess();
  }, [sessionId, dispatch]);

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Payment Issue - Session: " + sessionId);
    const body = encodeURIComponent(
      `Hello, I encountered an issue with my payment confirmation. Session ID: ${sessionId}. Please help verify my payment status.`
    );
    window.location.href = `mailto:support@ecostore.com?subject=${subject}&body=${body}`;
  };

  // Processing State
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 border-4 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Processing Your Order
          </h2>
          <p className="text-gray-300 mb-4">
            Please wait while we confirm your payment...
          </p>
          {retryCount > 0 && (
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Retry attempt {retryCount}/3</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-red-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-lg mx-4"
        >
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Payment Confirmation Issue
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>

          {sessionId && (
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-400 mb-2">For support reference:</p>
              <p className="text-sm text-white font-mono">Session ID: {sessionId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactSupport}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Contact Support
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

  // Success State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-lg mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Thank you for your purchase! Your order has been confirmed and is being
            processed.
          </p>

          {orderDetails && (
            <div className="bg-white/5 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Details:
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-mono">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment ID:</span>
                  <span className="font-mono text-xs">
                    {orderDetails.sessionId.substring(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">✓ Confirmed</span>
                </div>
                {orderDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-eco-green font-semibold">
                      ${orderDetails.amount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 text-left">
            <h4 className="text-blue-400 font-semibold mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                You'll receive an email confirmation within 5-10 minutes
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Your order will be processed within 24 hours
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Tracking information will be sent via email
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Estimated delivery: 3-5 business days
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)",
              }}
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
