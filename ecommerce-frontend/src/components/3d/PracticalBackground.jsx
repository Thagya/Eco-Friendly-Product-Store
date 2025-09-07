// src/components/3d/ParticleBackground.jsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function Particles(props) {
  const ref = useRef();
  
  const [sphere] = useMemo(() => [
    random.inSphere(new Float32Array(5000), { radius: 1.2 })
  ], []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#0ea5e9"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function FloatingShapes() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, 0, -5]}>
      <torusGeometry args={[0.3, 0.1, 16, 100]} />
      <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Particles />
        <FloatingShapes />
        
        {/* Additional floating elements */}
        <mesh position={[-2, 1, -3]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#ec4899" transparent opacity={0.6} />
        </mesh>
        
        <mesh position={[1, -1, -4]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.4} />
        </mesh>
      </Canvas>
      
      {/* Additional CSS gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default ParticleBackground;