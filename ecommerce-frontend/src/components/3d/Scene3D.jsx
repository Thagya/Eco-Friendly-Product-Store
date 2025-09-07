import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import FloatingElements from "./FloatingElements";

const Scene3D = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* Subtle depth for a premium feel */}
      <fog attach="fog" args={["#0b0f19", 18, 30]} />

      {/* Lighting tuned for dark theme */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-6, -2, -4]} intensity={0.5} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-sm text-gray-400">Loading 3D…</div>
          </Html>
        }
      >
        {/* Tasteful floating shapes (non-blocking, low poly) */}
        <FloatingElements count={7} spread={7} seed={27} />
      </Suspense>

      {/* Keep the background calm: no pan/zoom; slow autorotate */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        // If you want slow autorotation, set enableRotate true and uncomment next line
        // autoRotate
        // autoRotateSpeed={0.4}
      />
    </Canvas>
  );
};

export default Scene3D;
