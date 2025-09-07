// src/hooks/use3D.js
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

export const use3D = () => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize 3D scene
  const initScene = useCallback((container, options = {}) => {
    try {
      if (!container) throw new Error('Container element required');

      const {
        width = container.clientWidth,
        height = container.clientHeight,
        background = 0x000000,
        alpha = true,
        antialias = true
      } = options;

      // Scene
      const scene = new THREE.Scene();
      scene.background = alpha ? null : new THREE.Color(background);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ 
        alpha,
        antialias,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Add to container
      container.appendChild(renderer.domElement);

      // Basic lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      setIsLoading(false);
      setError(null);

      return { scene, camera, renderer };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  // Create basic geometries
  const createGeometry = useCallback((type, params = {}) => {
    try {
      switch (type) {
        case 'box':
          return new THREE.BoxGeometry(
            params.width || 1,
            params.height || 1,
            params.depth || 1
          );
        case 'sphere':
          return new THREE.SphereGeometry(
            params.radius || 1,
            params.widthSegments || 32,
            params.heightSegments || 16
          );
        case 'cylinder':
          return new THREE.CylinderGeometry(
            params.radiusTop || 1,
            params.radiusBottom || 1,
            params.height || 1,
            params.radialSegments || 8
          );
        case 'plane':
          return new THREE.PlaneGeometry(
            params.width || 1,
            params.height || 1
          );
        case 'cone':
          return new THREE.ConeGeometry(
            params.radius || 1,
            params.height || 1,
            params.radialSegments || 8
          );
        case 'torus':
          return new THREE.TorusGeometry(
            params.radius || 1,
            params.tube || 0.4,
            params.radialSegments || 8,
            params.tubularSegments || 6
          );
        default:
          throw new Error(`Unknown geometry type: ${type}`);
      }
    } catch (err) {
      console.error('Error creating geometry:', err);
      return new THREE.BoxGeometry(1, 1, 1); // fallback
    }
  }, []);

  // Create materials
  const createMaterial = useCallback((type, params = {}) => {
    try {
      switch (type) {
        case 'basic':
          return new THREE.MeshBasicMaterial(params);
        case 'standard':
          return new THREE.MeshStandardMaterial(params);
        case 'phong':
          return new THREE.MeshPhongMaterial(params);
        case 'lambert':
          return new THREE.MeshLambertMaterial(params);
        default:
          return new THREE.MeshStandardMaterial(params);
      }
    } catch (err) {
      console.error('Error creating material:', err);
      return new THREE.MeshStandardMaterial({ color: 0x10b981 });
    }
  }, []);

  // Create mesh
  const createMesh = useCallback((geometryType, materialType, geometryParams = {}, materialParams = {}) => {
    const geometry = createGeometry(geometryType, geometryParams);
    const material = createMaterial(materialType, materialParams);
    return new THREE.Mesh(geometry, material);
  }, [createGeometry, createMaterial]);

  // Animation helpers
  const animate = useCallback((callback) => {
    const render = () => {
      if (callback) callback();
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationIdRef.current = requestAnimationFrame(render);
    };
    render();
  }, []);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // Resize handler
  const handleResize = useCallback((width, height) => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
  }, []);

  // Add object to scene
  const addToScene = useCallback((object) => {
    if (sceneRef.current && object) {
      sceneRef.current.add(object);
    }
  }, []);

  // Remove object from scene
  const removeFromScene = useCallback((object) => {
    if (sceneRef.current && object) {
      sceneRef.current.remove(object);
      // Dispose of geometry and material to free memory
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  }, []);

  // Create floating animation
  const createFloatingAnimation = useCallback((object, amplitude = 0.5, speed = 1) => {
    let time = 0;
    return () => {
      time += 0.01 * speed;
      if (object) {
        object.position.y += Math.sin(time) * amplitude * 0.01;
      }
    };
  }, []);

  // Create rotation animation
  const createRotationAnimation = useCallback((object, speed = 1) => {
    return () => {
      if (object) {
        object.rotation.y += 0.01 * speed;
      }
    };
  }, []);

  // Create pulsing animation
  const createPulsingAnimation = useCallback((object, minScale = 0.8, maxScale = 1.2, speed = 1) => {
    let time = 0;
    return () => {
      time += 0.01 * speed;
      if (object) {
        const scale = minScale + (maxScale - minScale) * (Math.sin(time) * 0.5 + 0.5);
        object.scale.setScalar(scale);
      }
    };
  }, []);

  // Load texture
  const loadTexture = useCallback((url) => {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }, []);

  // Dispose of all resources
  const dispose = useCallback(() => {
    stopAnimation();
    
    if (sceneRef.current) {
      // Dispose of all objects in scene
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
    }

    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
  }, [stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  // Mouse interaction helpers
  const getMousePosition = useCallback((event, element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
  }, []);

  // Raycasting for mouse interactions
  const raycast = useCallback((mousePosition, objects = []) => {
    if (!cameraRef.current || !sceneRef.current) return [];

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, cameraRef.current);

    const targetObjects = objects.length > 0 ? objects : sceneRef.current.children;
    return raycaster.intersectObjects(targetObjects, true);
  }, []);

  return {
    // Core 3D functionality
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    
    // State
    isLoading,
    error,
    
    // Setup methods
    initScene,
    handleResize,
    dispose,
    
    // Creation methods
    createGeometry,
    createMaterial,
    createMesh,
    
    // Scene management
    addToScene,
    removeFromScene,
    
    // Animation methods
    animate,
    stopAnimation,
    createFloatingAnimation,
    createRotationAnimation,
    createPulsingAnimation,
    
    // Utility methods
    loadTexture,
    getMousePosition,
    raycast,
    
    // Constants for easy access
    THREE
  };
};