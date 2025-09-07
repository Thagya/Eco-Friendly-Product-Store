// src/components/common/Loading.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Package } from 'lucide-react';

// 3D Loading Sphere
function LoadingSphere() {
  return (
    <Sphere args={[1, 32, 32]} scale={0.8}>
      <MeshDistortMaterial
        color="#10b981"
        attach="material"
        distort={0.5}
        speed={2}
        wireframe={false}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

// 3D Loading Scene
function LoadingScene() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <LoadingSphere />
      </Suspense>
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}

// Simple CSS Loading Spinner
const SimpleSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className={`${sizeClasses[size]} border-2 border-eco-green border-t-transparent rounded-full`}
    />
  );
};

// Dots Loading Animation
const DotsLoader = () => {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
          className="w-3 h-3 bg-eco-green rounded-full"
        />
      ))}
    </div>
  );
};

// Pulse Loading Animation
const PulseLoader = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-16 h-16 bg-gradient-to-r from-eco-green to-eco-leaf rounded-full flex items-center justify-center"
    >
      <Package className="w-8 h-8 text-white" />
    </motion.div>
  );
};

// Main Loading Component
const Loading = ({ 
  type = 'full', 
  variant = '3d',
  message = 'Loading...',
  size = 'medium'
}) => {
  const renderLoader = () => {
    switch (variant) {
      case '3d':
        return (
          <div className="w-32 h-32">
            <LoadingScene />
          </div>
        );
      case 'spinner':
        return <SimpleSpinner size={size} />;
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      default:
        return <SimpleSpinner size={size} />;
    }
  };

  // Inline/Small Loading
  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center space-x-2">
        {renderLoader()}
        {message && (
          <span className="text-gray-300 text-sm">{message}</span>
        )}
      </div>
    );
  }

  // Card Loading
  if (type === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
      >
        {renderLoader()}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-300 text-center"
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Full Screen Loading
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center space-y-8">
        
        {/* 3D Loading Animation */}
        <div className="relative">
          {renderLoader()}
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-eco-green/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white"
          >
            {message}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300"
          >
            Please wait while we prepare your eco-friendly experience
          </motion.p>
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-eco-green to-eco-leaf rounded-full"
          style={{ width: '200px' }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -50, 50, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 8 + index * 2,
                repeat: Infinity,
                ease: "linear",
                delay: index * 1.5
              }}
              className="absolute w-4 h-4 bg-eco-green/30 rounded-full"
              style={{
                left: `${20 + index * 30}%`,
                top: `${30 + index * 20}%`
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Loading;