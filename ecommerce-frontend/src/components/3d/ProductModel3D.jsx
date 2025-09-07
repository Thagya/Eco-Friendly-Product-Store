import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  ContactShadows,
  Html,
} from "@react-three/drei";

/**
 * Inner component responsible for rendering the GLB, centered with optional autorotation.
 */
function ModelContent({ modelPath, scale = 1, autoRotate = true }) {
  const group = useRef();

  // Try loading the model; if it fails, render a placeholder.
  let gltf = null;
  try {
    if (modelPath) {
      gltf = useGLTF(modelPath);
    }
  } catch (e) {
    // swallow; gltf will remain null and we'll render the placeholder
  }

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  if (!gltf) {
    // Elegant placeholder when no/invalid modelPath
    return (
      <group ref={group}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <meshStandardMaterial
            metalness={0.6}
            roughness={0.25}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group} dispose={null}>
      <Center>
        <primitive object={gltf.scene} scale={scale} />
      </Center>
    </group>
  );
}

/**
 * Public Viewer component with its own Canvas. Used in Product Detail page.
 */
const ProductModel3D = ({
  modelPath = "/assets/models/product-showcase.glb",
  scale = 1,
  autoRotate = true,
  controls = true,
  allowZoom = true,
  height = 520,
}) => {
  // Preload the default model for snappier UX (safe even if custom modelPath is used later)
  try {
    useGLTF.preload("/assets/models/product-showcase.glb");
  } catch (_) {}

  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900/40 to-gray-900/10"
      style={{ height }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 3.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -2, -4]} intensity={0.4} />

        <Suspense
          fallback={
            <Html center wrapperClass="pointer-events-none">
              <div className="px-3 py-1 text-xs rounded bg-gray-800/70 text-gray-200">
                Loading product…
              </div>
            </Html>
          }
        >
          <ModelContent
            modelPath={modelPath}
            scale={scale}
            autoRotate={autoRotate}
          />
          {/* Soft shadow for premium look */}
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.35}
            scale={10}
            blur={2.5}
            far={3}
          />
        </Suspense>

        {controls && (
          <OrbitControls
            enablePan={false}
            enableZoom={allowZoom}
            enableRotate
            minDistance={1.8}
            maxDistance={6}
            maxPolarAngle={Math.PI / 1.9}
            makeDefault
          />
        )}
      </Canvas>
    </div>
  );
};

export default ProductModel3D;
