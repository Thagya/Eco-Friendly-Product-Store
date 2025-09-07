import React from "react";
import { motion } from "framer-motion";

const Button = ({ children, onClick, type = "button", full = false, disabled = false, variant = "primary" }) => {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2";
  const variants = {
    primary: "bg-eco-green hover:bg-emerald-600 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-gray-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
