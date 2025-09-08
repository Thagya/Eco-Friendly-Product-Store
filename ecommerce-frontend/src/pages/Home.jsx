// src/pages/Home.jsx - FIXED WITH PRODUCT IMAGES
import React, { Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { 
  ShoppingBag, 
  Leaf, 
  Recycle, 
  Heart,
  ArrowRight,
  Star,
  Users,
  Package,
  Eye
} from 'lucide-react';
import { fetchProducts } from '../store/productsSlice';

// 3D Hero Scene
function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
      
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 100, 200]} scale={2}>
            <MeshDistortMaterial
              color="#0ea5e9"
              attach="material"
              distort={0.3}
              speed={2}
              wireframe={false}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </Float>
        
        <Float speed={2} rotationIntensity={2} floatIntensity={1} position={[3, 1, -2]}>
          <Sphere args={[0.5, 50, 100]}>
            <MeshDistortMaterial
              color="#10b981"
              attach="material"
              distort={0.4}
              speed={3}
              wireframe
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
        
        <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.5} position={[-3, -1, -1]}>
          <Sphere args={[0.3, 32, 64]}>
            <MeshDistortMaterial
              color="#ec4899"
              attach="material"
              distort={0.2}
              speed={1.5}
              transparent
              opacity={0.7}
            />
          </Sphere>
        </Float>
      </Suspense>
      
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ 
      scale: 1.05,
      rotateY: 5,
      rotateX: 5,
    }}
    className="group relative p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-eco-green/50 transition-all duration-300"
    style={{
      transformStyle: 'preserve-3d',
    }}
  >
    <div className="relative z-10">
      <div className="w-12 h-12 bg-gradient-to-r from-eco-green to-eco-leaf rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
    
    {/* Hover glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-eco-green/20 to-eco-leaf/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
);

// Enhanced Product Card Component with images
const ProductCard = ({ product, delay }) => {
  const [imageError, setImageError] = React.useState(false);
  
  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('data:image/')) return image; // Base64
    if (image.startsWith('http')) return image; // Full URL
    return image; // Return as is
  };

  const productImage = getImageUrl(product.image);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 10,
        z: 50
      }}
      className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-eco-green/50 overflow-hidden transition-all duration-300"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Link to={`/products/${product._id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-w-1 aspect-h-1 h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {productImage && !imageError ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-eco-green/20 to-eco-leaf/20 flex items-center justify-center">
              <Package className="w-16 h-16 text-eco-green group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-full transition-colors cursor-pointer"
              title="View Product"
            >
              <Eye className="w-5 h-5" />
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic here
              }}
              className="p-2 bg-eco-green/80 hover:bg-eco-green text-white rounded-full transition-colors"
              title="Add to Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Stock badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10
                ? "bg-green-500/80 text-green-100"
                : product.stock > 0
                ? "bg-yellow-500/80 text-yellow-100"
                : "bg-red-500/80 text-red-100"
            }`}>
              {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
            </span>
          </div>
        </div>
        
        {/* Product info */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-eco-green transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Category */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-eco-green/20 text-eco-green text-xs font-medium rounded-full">
              {product.category}
            </span>
          </div>

          {/* Price and rating */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-eco-green">
                ${product.price}
              </span>
              <div className="flex items-center space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">(4.2)</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);
  
  // Load products when component mounts
  useEffect(() => {
    if (products.length === 0 && !isLoading) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length, isLoading]);
  
  const featuredProducts = products.slice(0, 6);

  const features = [
    {
      icon: Leaf,
      title: "100% Eco-Friendly",
      description: "All our products are made from sustainable materials with zero environmental impact."
    },
    {
      icon: Recycle,
      title: "Fully Recyclable",
      description: "Every item can be recycled or composted, contributing to a circular economy."
    },
    {
      icon: Heart,
      title: "Ethically Made",
      description: "Fair trade practices ensuring both quality products and ethical manufacturing."
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "10K+", icon: Users },
    { label: "Products Sold", value: "50K+", icon: Package },
    { label: "Trees Planted", value: "25K+", icon: Leaf },
    { label: "Rating", value: "4.9", icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image + 3D Scene */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/images/backgrounds/hero2.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <HeroScene />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-eco-green to-eco-leaf bg-clip-text text-transparent">
                Sustainable
              </span>
              <br />
              <span className="text-white">Shopping</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover eco-friendly products that make a difference. Shop sustainably, 
              live responsibly, and help create a better planet for future generations.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-2xl shadow-lg hover:shadow-eco-green/25 transition-all duration-300"
                >
                  <span className="flex items-center space-x-2">
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/60 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-eco-green to-eco-leaf rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-gray-400">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-eco-green">EcoStore</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're committed to providing sustainable solutions that don't compromise on quality or style.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured <span className="text-eco-green">Products</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our hand-picked selection of eco-friendly products that make a difference.
            </p>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-400">Loading products...</span>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6">Check back soon for amazing eco-friendly products!</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 hover:border-eco-green/50 transition-all duration-300"
              >
                View All Products
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;