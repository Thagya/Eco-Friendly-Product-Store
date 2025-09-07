import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/** Small deterministic PRNG to keep positions stable across renders */
function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randBetween(rng, min, max) {
  return min + (max - min) * rng();
}

const SHAPES = ["torus", "icosa", "box", "knot"];

function OneFloating({ type, position, rotation, scale }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.rotation.x = rotation[0] + Math.sin(t * 0.6) * 0.2;
    ref.current.rotation.y = rotation[1] + Math.cos(t * 0.4) * 0.2;
    ref.current.position.y = position[1] + Math.sin(t + position[0]) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {type === "torus" && <torusGeometry args={[0.7, 0.22, 16, 96]} />}
      {type === "icosa" && <icosahedronGeometry args={[0.8, 0]} />}
      {type === "box" && <boxGeometry args={[1, 1, 1]} />}
      {type === "knot" && <torusKnotGeometry args={[0.6, 0.18, 120, 16]} />}
      <meshStandardMaterial
        metalness={0.65}
        roughness={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/**
 * FloatingElements
 * @param {number} count   - number of shapes
 * @param {number} spread  - how far to scatter around origin (rough radius)
 * @param {number} seed    - deterministic layout seed
 */
const FloatingElements = ({ count = 6, spread = 6, seed = 42 }) => {
  const items = useMemo(() => {
    const rng = mulberry32(seed);
    return new Array(count).fill(0).map((_, i) => {
      const type = SHAPES[Math.floor(rng() * SHAPES.length)];
      const x = randBetween(rng, -spread, spread);
      const y = randBetween(rng, -spread * 0.3, spread * 0.3);
      const z = randBetween(rng, -spread, -2); // push backward slightly
      const rx = randBetween(rng, 0, Math.PI);
      const ry = randBetween(rng, 0, Math.PI);
      const s = randBetween(rng, 0.7, 1.6);
      return {
        key: `${type}-${i}`,
        type,
        position: [x, y, z],
        rotation: [rx, ry, 0],
        scale: s,
      };
    });
  }, [count, spread, seed]);

  return (
    <>
      {items.map((cfg) => (
        <OneFloating key={cfg.key} {...cfg} />
      ))}
    </>
  );
};

export default FloatingElements;
