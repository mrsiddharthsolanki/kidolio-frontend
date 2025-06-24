import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sparkles, SoftShadows, Text, Environment } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

// Professional Node component with bubble-like appearance
const BubblePlanet = ({ position, label, color, onClick, size = 0.5, isMain = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      
      if (hovered) {
        meshRef.current.scale.setScalar(1.15);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    
    if (glowRef.current) {
      (glowRef.current.material as THREE.Material).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const bubbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create bubble gradient
    const gradient = ctx.createRadialGradient(256, 200, 0, 256, 200, 256);
    gradient.addColorStop(0, `${color}FF`);
    gradient.addColorStop(0.7, `${color}CC`);
    gradient.addColorStop(0.9, `${color}66`);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add bubble highlights
    const highlight = ctx.createRadialGradient(180, 150, 0, 180, 150, 80);
    highlight.addColorStop(0, 'rgba(255,255,255,0.8)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, 512, 512);
    
    return new THREE.CanvasTexture(canvas);
  }, [color]);

  return (
    <group position={position}>
      {/* Outer glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.5, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main bubble planet */}
      <mesh 
        ref={meshRef}
        castShadow 
        receiveShadow
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshPhysicalMaterial
          map={bubbleTexture}
          color={color}
          metalness={0.1}
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent={true}
          opacity={0.9}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Surface details for main planet */}
      {isMain && (
        <>
          {/* Core glow */}
          <mesh>
            <sphereGeometry args={[size * 0.3, 32, 32]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Floating particles */}
          <Sparkles 
            count={8} 
            scale={[size * 3, size * 3, size * 3]} 
            size={1.5} 
            color="white" 
            speed={0.3}
            opacity={0.6}
          />
        </>
      )}
      
      {/* Clean text label without glass effect */}
      <Html distanceFactor={12} center>
        <div 
          className="text-white text-sm font-semibold select-none pointer-events-none"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.05em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)',
            textAlign: 'center',
            fontWeight: '600'
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// Minimal orbital rings
const MinimalOrbitRings = ({ isLight = false }) => {
  const ringsRef = useRef<Array<THREE.Mesh | null>>([]);
  useFrame((state) => {
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        ring.rotation.z = state.clock.elapsedTime * (0.02 + index * 0.01);
      }
    });
  });
  // Make orbit lines more visible and colored for each planet
  // Add more rings for all planets (8 total)
  const ringColors = isLight
    ? ['#38bdf8', '#fbbf24', '#a5b4fc', '#10b981', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4']
    : ['#ffffff', '#8b5cf6', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];
  const radii = [3, 4.5, 6, 5, 5, 5, 4.95, 4.95]; // match planet orbits
  const rings = useMemo(() => {
    return radii.map((radius, idx) => (
      <mesh 
        key={idx} 
        ref={el => ringsRef.current[idx] = el}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius - 0.04, radius + 0.04, 128]} />
        <meshBasicMaterial 
          color={ringColors[idx]}
          transparent 
          opacity={isLight ? 0.48 - idx * 0.05 : 0.32 - idx * 0.03}
          side={THREE.DoubleSide} 
        />
      </mesh>
    ));
  }, [isLight]);
  return <group>{rings}</group>;
};

// Enhanced main child planet with detailed textures
const MainChildPlanet = () => {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.003;
      planetRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.001;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const childTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create child-themed gradient
    const gradient = ctx.createRadialGradient(512, 400, 0, 512, 400, 500);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.3, '#3b82f6');
    gradient.addColorStop(0.7, '#1e40af');
    gradient.addColorStop(1, '#1e3a8a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add playful patterns
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 20 + Math.random() * 40;
      
      const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      spotGradient.addColorStop(0, 'rgba(255,255,255,0.6)');
      spotGradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = spotGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group position={[0, 0, -1]}>
      {/* Outer atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshBasicMaterial 
          color="#93c5fd" 
          transparent 
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Inner energy core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Main planet with detailed texture */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 128, 128]} />
        <meshPhysicalMaterial
          map={childTexture}
          color="#60a5fa"
          metalness={0.1}
          roughness={0.2}
          transmission={0.6}
          thickness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent={true}
          opacity={0.95}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Ambient sparkles */}
      <Sparkles 
        count={25} 
        scale={[6, 6, 6]} 
        size={2} 
        color="#dbeafe" 
        speed={0.2}
        opacity={0.5}
      />
    </group>
  );
};

// Rotating planet system
const PlanetSystem = ({ planetsDropIn = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [dropProgress, setDropProgress] = useState(0);
  useEffect(() => {
    if (planetsDropIn) {
      setDropProgress(0);
      let start;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const t = Math.min(elapsed / 1100, 1);
        function easeOutBounce(x) {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (x < 1 / d1) {
            return n1 * x * x;
          } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
          } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
          } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
          }
        }
        const bounce = easeOutBounce(t);
        setDropProgress(bounce);
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else {
      setDropProgress(0);
    }
  }, [planetsDropIn]);

  // Animate all planets in orbit (slower, more beautiful)
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      groupRef.current.children.forEach((planet, i) => {
        // Each planet orbits at a different speed and phase
        const base = [
          [5, 0, 0], [-5, 0, 0], [0, 5, 0], [0, -5, 0],
          [3.5, 3.5, 0], [-3.5, 3.5, 0], [3.5, -3.5, 0], [-3.5, -3.5, 0]
        ];
        const radius = Math.sqrt(base[i][0] ** 2 + base[i][1] ** 2);
        const speed = 0.12 + i * 0.04; // slower speed for all planets
        const phase = i * Math.PI / 4;
        const angle = time * speed + phase;
        const y = base[i][1];
        // For drop-in animation, animate Y from above
        const dropY = planetsDropIn ? y * dropProgress + (1 - dropProgress) * (y + 10) : y;
        planet.position.x = Math.cos(angle) * radius;
        planet.position.z = Math.sin(angle) * radius;
        planet.position.y = dropY;
        // Add gentle up/down floating for beauty
        planet.position.y += Math.sin(time * 0.7 + i) * 0.18;
      });
    }
  });

  const planetDefs = [
    { pos: [5, 0, 0], label: 'Parent', color: '#10b981' },
    { pos: [-5, 0, 0], label: 'Teacher', color: '#8b5cf6' },
    { pos: [0, 5, 0], label: 'Admin', color: '#f59e0b' },
    { pos: [0, -5, 0], label: 'Reports', color: '#ec4899' },
    { pos: [3.5, 3.5, 0], label: 'Health', color: '#eab308', size: 0.45 },
    { pos: [-3.5, 3.5, 0], label: 'Study', color: '#06b6d4', size: 0.45 },
    { pos: [3.5, -3.5, 0], label: 'Sports', color: '#f97316', size: 0.45 },
    { pos: [-3.5, -3.5, 0], label: 'Awards', color: '#22d3ee', size: 0.45 },
  ];
  return (
    <group ref={groupRef}>
      {planetDefs.map((def, i) => (
        <BubblePlanet 
          key={def.label}
          position={def.pos}
          label={def.label}
          color={def.color}
          size={def.size || 0.6}
          onClick={() => alert(`${def.label} Clicked`)}
        />
      ))}
    </group>
  );
};

// Floating geometric shapes for visual interest
const FloatingShapes = () => {
  const shapesRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (shapesRef.current) {
      shapesRef.current.rotation.y = clock.elapsedTime * 0.05;
      shapesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const shapes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 12 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 8;
      
      const shapeType = Math.floor(Math.random() * 3);
      
      return (
        <group key={i} position={[
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ]}>
          {shapeType === 0 && (
            <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
              <octahedronGeometry args={[0.2]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
          )}
          {shapeType === 1 && (
            <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
              <tetrahedronGeometry args={[0.25]} />
              <meshBasicMaterial color="#e0e7ff" transparent opacity={0.3} />
            </mesh>
          )}
          {shapeType === 2 && (
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#f0f9ff" transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      );
    });
  }, []);

  return <group ref={shapesRef}>{shapes}</group>;
};

export default function ProfessionalKidolio3D({ mode = 'dark', planetsDropIn = false, disableScrollZoom = false }) {
  // Choose environment and background based on mode
  const isLight = mode === 'light';
  return (
    <div className={`w-full h-[700px] overflow-hidden ${isLight ? 'bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-100' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950'} shadow-2xl relative`}>
      {/* Overlay for readability, different for light and dark */}
      <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-b from-white/30 via-transparent to-blue-100/40' : 'bg-gradient-to-b from-black/10 via-transparent to-black/30'} z-10 pointer-events-none`} />
      <Canvas 
        camera={{ position: [0, 3, 15], fov: 50 }} 
        shadows 
        className="w-full h-full"
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: isLight ? THREE.ReinhardToneMapping : THREE.ACESFilmicToneMapping,
          toneMappingExposure: isLight ? 1.0 : 1.2
        }}
      >
        {/* Enhanced lighting for depth */}
        {isLight ? (
          <>
            <ambientLight intensity={0.8} color="#fff" />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.7} 
              color="#fffbe6"
              castShadow 
              shadow-mapSize-width={2048} 
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-8, 5, 8]} intensity={0.8} color="#60a5fa" />
            <pointLight position={[8, -5, -8]} intensity={0.6} color="#fbbf24" />
          </>
        ) : (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.4} 
              castShadow 
              shadow-mapSize-width={2048} 
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-8, 5, 8]} intensity={0.9} color="#8b5cf6" />
            <pointLight position={[8, -5, -8]} intensity={0.7} color="#10b981" />
          </>
        )}
        <SoftShadows size={25} samples={20} focus={1} />
        {/* Environment: day or night */}
        <Environment preset={isLight ? 'sunset' : 'night'} />
        <OrbitControls 
          autoRotate 
          enableZoom={!disableScrollZoom}
          enablePan={false}
          minDistance={10}
          maxDistance={25}
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
          dampingFactor={0.05}
          enableDamping={true}
        />
        {/* Starfield or clouds/sky for day mode */}
        {isLight ? (
          <Sparkles 
            count={32} 
            scale={[28, 28, 28]} 
            size={2} 
            color="#fbbf24" 
            speed={0.18}
            opacity={0.28}
          />
        ) : (
          <Stars 
            radius={220} 
            depth={120} 
            count={8000} 
            factor={5} 
            fade 
            speed={0.35} 
          />
        )}
        {/* Subtle ambient particles */}
        <Sparkles 
          count={isLight ? 22 : 40} 
          scale={[28, 28, 28]} 
          size={1.2} 
          color={isLight ? "#fbbf24" : "#f8fafc"} 
          speed={0.22}
          opacity={isLight ? 0.22 : 0.45}
        />
        {/* Floating geometric shapes */}
        <FloatingShapes />
        {/* Main child planet with professional details */}
        <MainChildPlanet />
        {/* Clean orbital system */}
        <MinimalOrbitRings isLight={isLight} />
        <PlanetSystem planetsDropIn={planetsDropIn} />
        {/* Atmospheric depth: lighter for day */}
        <fog attach="fog" args={[isLight ? '#e0f2fe' : '#0f1629', 20, 50]} />
      </Canvas>
    </div>
  );
}