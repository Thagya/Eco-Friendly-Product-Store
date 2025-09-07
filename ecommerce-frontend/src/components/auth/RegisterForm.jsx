import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { registerUser } from "../../store/authSlice";

import Input from "../ui/Input";
import Button from "../ui/Button";

const RegisterForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",  // ✅ Matches backend expectation
  password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(formData)).unwrap();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-md mx-auto p-6 bg-slate-900/80 rounded-2xl shadow-xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
        <UserPlus className="w-6 h-6 text-eco-green" />
        <span>Register</span>
      </h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Input
        icon={<User className="w-4 h-4 text-gray-400" />}
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      
      <Input
        icon={<Lock className="w-4 h-4 text-gray-400" />}
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <Button type="submit" disabled={isLoading} full>
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </motion.form>
  );
};

export default RegisterForm;
