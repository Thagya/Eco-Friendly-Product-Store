import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import Modal from "../ui/Modal";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onClose}>
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {isLogin ? (
                <LoginForm onSuccess={onClose} />
              ) : (
                <RegisterForm onSuccess={onClose} />
              )}

              <div className="text-center mt-4">
                {isLogin ? (
                  <p className="text-gray-400 text-sm">
                    Don’t have an account?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-eco-green hover:underline"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-eco-green hover:underline"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
