// src/pages/Register.jsx
import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { User, Lock, Eye, EyeOff, UserPlus, ArrowLeft, Check } from "lucide-react";

import { registerUser, clearError } from "../store/authSlice";

// 3D Background Scene
function RegisterBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ec4899" />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.7} floatIntensity={0.7}>
          <Sphere args={[1.2, 100, 200]} scale={1.3} position={[-2, 1, -2]}>
            <MeshDistortMaterial
              color="#ec4899"
              attach="material"
              distort={0.25}
              speed={1.8}
              wireframe
              transparent
              opacity={0.4}
            />
          </Sphere>
        </Float>

        <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1} position={[2, -1, -1]}>
          <Sphere args={[0.8, 64, 128]} scale={1.1}>
            <MeshDistortMaterial
              color="#0ea5e9"
              attach="material"
              distort={0.35}
              speed={2.2}
              transparent
              opacity={0.5}
            />
          </Sphere>
        </Float>

        <Float speed={0.6} rotationIntensity={0.4} floatIntensity={0.6} position={[0, 2.5, -3]}>
          <Sphere args={[0.6, 32, 64]}>
            <MeshDistortMaterial
              color="#10b981"
              attach="material"
              distort={0.3}
              speed={1.3}
              wireframe
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={-0.3} />
    </Canvas>
  );
}

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < strength ? strengthColors[strength - 1] : "bg-gray-600"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${
          strength < 3 ? "text-red-400" : strength < 4 ? "text-yellow-400" : "text-green-400"
        }`}
      >
        Password strength: {strengthLabels[strength - 1] || "Enter password"}
      </p>
    </div>
  );
};

// Input Field Component
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  showPasswordToggle,
  onTogglePassword,
  showStrength,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green transition-all duration-300 ${
          error ? "border-red-400" : "border-white/20 hover:border-white/40"
        }`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {type === "password" ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>

    {showStrength && <PasswordStrength password={value} />}

    {error && (
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm">
        {error}
      </motion.p>
    )}
  </div>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Local JWT-only validation
  const validateForm = (data) => {
    const errors = {};
    if (!data.username.trim()) errors.username = "Username is required";
    else if (data.username.length < 3) errors.username = "Username must be at least 3 characters";
    if (!data.password) errors.password = "Password is required";
    else if (data.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      await dispatch(registerUser({ username: formData.username, password: formData.password })).unwrap();
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // ✅ Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RegisterBackground />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-4">Account Created!</h1>
            <p className="text-gray-300 mb-6">Welcome to EcoStore! Redirecting you to login...</p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full mx-auto"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // ✅ Main register form
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <RegisterBackground />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <UserPlus className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-300">Join EcoStore and start shopping sustainably</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                icon={User}
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange("username")}
                error={errors.username}
              />

              <InputField
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange("password")}
                error={errors.password}
                showPasswordToggle
                onTogglePassword={() => setShowPassword(!showPassword)}
                showStrength
              />

              <InputField
                icon={Lock}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                error={errors.confirmPassword}
                showPasswordToggle
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(236, 72, 153, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center mt-6">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-eco-green hover:text-eco-leaf transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-eco-green hover:text-eco-leaf transition-colors">
                Privacy Policy
              </Link>
            </p>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link to="/login" className="text-eco-green hover:text-eco-leaf font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
