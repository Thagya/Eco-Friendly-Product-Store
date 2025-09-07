// src/pages/Login.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { Lock, Eye, EyeOff, LogIn, ArrowLeft, User } from 'lucide-react';

import { loginUser, clearError } from '../store/authSlice';

// 3D Background Scene
function LoginBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#10b981" />

      <Suspense fallback={null}>
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[1, 100, 200]} scale={1.5} position={[2, 1, -2]}>
            <MeshDistortMaterial
              color="#0ea5e9"
              attach="material"
              distort={0.2}
              speed={1.5}
              wireframe
              transparent
              opacity={0.3}
            />
          </Sphere>
        </Float>

        <Float speed={1.5} rotationIntensity={1} floatIntensity={1} position={[-2, -1, -1]}>
          <Sphere args={[0.7, 64, 128]} scale={1.2}>
            <MeshDistortMaterial
              color="#10b981"
              attach="material"
              distort={0.3}
              speed={2}
              transparent
              opacity={0.4}
            />
          </Sphere>
        </Float>

        <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.8} position={[0, 2, -3]}>
          <Sphere args={[0.5, 32, 64]}>
            <MeshDistortMaterial
              color="#ec4899"
              attach="material"
              distort={0.4}
              speed={1.8}
              wireframe
              transparent
              opacity={0.5}
            />
          </Sphere>
        </Float>
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

// Input Field Component
const InputField = ({ 
  icon: Icon, 
  type, 
  placeholder, 
  value, 
  onChange, 
  error,
  showPasswordToggle,
  onTogglePassword 
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
          error ? 'border-red-400' : 'border-white/20 hover:border-white/40'
        }`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {type === 'password' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 text-sm"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  // Local form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0"><LoginBackground /></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => navigate('/')}
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
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-eco-green to-eco-leaf rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <LogIn className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-300">Sign in to your EcoStore account</p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                icon={User}
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                error={errors.username}
              />
              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                showPasswordToggle
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link to="/register" className="text-eco-green hover:text-eco-leaf font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-eco-green/20 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
