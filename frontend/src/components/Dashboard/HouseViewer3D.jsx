import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, RoundedBox } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { Smartphone, Eye, Grid3x3, Layers, ChevronRight, X, Check, HelpCircle, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

const store = createXRStore();

// ─── MATERIAL OPTIONS ────────────────────────────────────────────────────────
export const MATERIAL_OPTIONS = {
  floor: [
    { id: 'vitrified', label: 'Vitrified Tiles', color: '#e8e0d0', price: 'Rs. 65/sqft' },
    { id: 'marble', label: 'Italian Marble (Luxury)', color: '#f5f0eb', price: 'Rs. 120/sqft' },
    { id: 'granite', label: 'Granite Slab', color: '#555555', price: 'Rs. 90/sqft' },
    { id: 'wood', label: 'Teak Wooden Planks', color: '#8B6347', price: 'Rs. 150/sqft' },
    { id: 'antiskid', label: 'Anti-Skid Tiles', color: '#c0bdb5', price: 'Rs. 55/sqft' },
    { id: 'terrazzo', label: 'Premium Terrazzo', color: '#d1cbc4', price: 'Rs. 85/sqft' },
  ],
  wall: [
    { id: 'cream', label: 'Cream Paint', color: '#faf5e4', price: 'Rs. 18/sqft' },
    { id: 'white', label: 'Pure White', color: '#ffffff', price: 'Rs. 15/sqft' },
    { id: 'grey', label: 'Warm Grey', color: '#b5b0a8', price: 'Rs. 18/sqft' },
    { id: 'blue', label: 'Sky Blue', color: '#bfd7ea', price: 'Rs. 20/sqft' },
    { id: 'texture', label: 'Texture Plaster Paint', color: '#d4c5a9', price: 'Rs. 35/sqft' },
  ],
  door: [
    { id: 'teak', label: 'Premium Teak Wood', color: '#5C3317', price: 'Rs. 12,000' },
    { id: 'flush', label: 'Flush Door', color: '#8B7355', price: 'Rs. 4,500' },
    { id: 'glass', label: 'Glass Panel Sliding Door', color: '#a8d8ea', price: 'Rs. 18,000' },
    { id: 'steel', label: 'Steel Safety Door', color: '#708090', price: 'Rs. 8,000' },
    { id: 'pvc', label: 'PVC Door', color: '#e8e0d8', price: 'Rs. 3,500' },
  ],
  roof: [
    { id: 'rcc', label: 'RCC Slab', color: '#9e9e9e', price: 'Standard' },
    { id: 'false', label: 'POP Cove LED Ceiling', color: '#f5f5f5', price: 'Rs. 55/sqft' },
    { id: 'gypsum', label: 'Gypsum Crown Board', color: '#eeeeee', price: 'Rs. 70/sqft' },
    { id: 'wooden', label: 'Wooden Paneled Roof', color: '#8B6347', price: 'Rs. 180/sqft' },
  ],
  switches: [
    { id: 'legrand', label: 'Legrand Modular', color: '#ffffff', price: 'Rs. 12,000 package' },
    { id: 'anchor', label: 'Anchor Roma', color: '#f1f5f9', price: 'Rs. 8,000 package' },
    { id: 'smart', label: 'Smart WiFi Touch Panel', color: '#000000', price: 'Rs. 24,000 package' },
  ],
  wiring: [
    { id: 'finolex', label: 'Finolex FRLSH', color: '#ef4444', price: 'Rs. 18,000 package' },
    { id: 'havells', label: 'Havells LifeLine', color: '#3b82f6', price: 'Rs. 22,000 package' },
    { id: 'polycab', label: 'Polycab Maxima', color: '#eab308', price: 'Rs. 20,000 package' },
  ],
  electronics: [
    { id: 'daikin', label: 'Daikin AC + TV Unit', color: '#e2e8f0', price: 'Rs. 85,000' },
    { id: 'samsung', label: 'Smart Home Hub Set', color: '#0f172a', price: 'Rs. 1,40,000' },
  ],
  utilities: [
    { id: 'kohler', label: 'Kohler Gold Taps', color: '#d4af37', price: 'Rs. 35,000' },
    { id: 'hindware', label: 'Hindware Standard', color: '#cbd5e1', price: 'Rs. 15,000' },
    { id: 'jaquar', label: 'Jaquar Premium Chrome', color: '#94a3b8', price: 'Rs. 25,000' },
  ]
};

// ─── ROOM CONFIG (Vastu-based) ─────────────────────────────────────────────
function getRooms(length, width) {
  const l = length * 0.09;
  const w = width * 0.09;
  return [
    { id: 'living', name: 'Living Room', direction: 'NE', color: '#dbeafe', x: -w * 0.25, z: -l * 0.2, rw: w * 0.5, rl: l * 0.4, h: 3.0 },
    { id: 'kitchen', name: 'Kitchen', direction: 'SE', color: '#fef9c3', x: w * 0.3, z: -l * 0.2, rw: w * 0.35, rl: l * 0.35, h: 2.8 },
    { id: 'master', name: 'Master Bedroom', direction: 'SW', color: '#fce7f3', x: -w * 0.25, z: l * 0.2, rw: w * 0.5, rl: l * 0.35, h: 3.0 },
    { id: 'bed2', name: 'Bedroom 2', direction: 'NW', color: '#ede9fe', x: w * 0.3, z: l * 0.2, rw: w * 0.35, rl: l * 0.35, h: 2.8 },
    { id: 'bath1', name: 'Bathroom', direction: 'W', color: '#ccfbf1', x: -w * 0.42, z: l * 0.35, rw: w * 0.15, rl: l * 0.2, h: 2.6 },
    { id: 'pooja', name: 'Pooja Room', direction: 'NE', color: '#fff7ed', x: w * 0.42, z: -l * 0.35, rw: w * 0.12, rl: l * 0.15, h: 2.6 },
  ];
}

// ─── PROCEDURAL CANVAS TEXTURE GENERATOR ────────────────────────────────────
function drawProceduralCanvas(type, optionId, colorHex) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 512, 512);

  if (optionId === 'marble') {
    // Italian Marble Veining
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.bezierCurveTo(150, 130, 300, 70, 512, 230);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(139, 90, 43, 0.08)';
    ctx.beginPath();
    ctx.moveTo(120, 512);
    ctx.bezierCurveTo(240, 340, 380, 430, 512, 140);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(70, 70, 70, 0.06)';
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.bezierCurveTo(190, 340, 250, 470, 430, 512);
    ctx.stroke();
  } else if (optionId === 'wood' || optionId === 'wooden') {
    // Elegant wood planks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
    // Subtle organic wood grain lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 16) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.bezierCurveTo(160, i + 8, 340, i - 8, 512, i);
      ctx.stroke();
    }
  } else if (optionId === 'vitrified') {
    // Large square floor tiles grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else if (optionId === 'terrazzo') {
    // Speckled stone chips
    const chipColors = ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa', '#cbd5e1'];
    for (let i = 0; i < 350; i++) {
      ctx.fillStyle = chipColors[Math.floor(Math.random() * chipColors.length)];
      ctx.beginPath();
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const rSize = 2 + Math.random() * 3.5;
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (optionId === 'antiskid') {
    // Diamond texture
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 512; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 512);
      ctx.lineTo(i + 512, 0);
      ctx.stroke();
    }
  } else if (type === 'wall' && optionId === 'texture') {
    // Plaster bumps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 1.5);
  tex.needsUpdate = true;
  return tex;
}

// Custom hook to fetch procedural textures
function useProceduralTexture(type, optionId, colorHex) {
  return React.useMemo(() => {
    return drawProceduralCanvas(type, optionId, colorHex);
  }, [type, optionId, colorHex]);
}

// ─── ANIMATED DOOR ────────────────────────────────────────────────────────
function AnimatedDoor({ position, color, isOpen, onClick }) {
  const doorRef = useRef();
  useFrame(() => {
    if (!doorRef.current) return;
    const target = isOpen ? -Math.PI / 2 : 0;
    doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, target, 0.08);
  });

  return (
    <group position={position}>
      <group ref={doorRef} position={[0.5, 0, 0]}>
        <mesh castShadow onClick={onClick} position={[-0.5, 1.0, 0]}>
          <boxGeometry args={[1.0, 2.0, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Luxury Gold Lever Handle */}
        <mesh position={[-0.15, 1.0, 0.06]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// ─── ANIMATED WINDOW ──────────────────────────────────────────────────────
function AnimatedWindow({ position, rotation, isOpen, onClick }) {
  const leftGlassRef = useRef();
  const rightGlassRef = useRef();

  useFrame(() => {
    const leftTarget = isOpen ? -0.5 : 0;
    const rightTarget = isOpen ? 0.5 : 0;
    if (leftGlassRef.current) leftGlassRef.current.position.x = THREE.MathUtils.lerp(leftGlassRef.current.position.x, leftTarget, 0.08);
    if (rightGlassRef.current) rightGlassRef.current.position.x = THREE.MathUtils.lerp(rightGlassRef.current.position.x, rightTarget, 0.08);
  });

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* Frame */}
      <Box args={[1.4, 1.1, 0.12]} castShadow>
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      </Box>
      {/* Sliding Glass Left */}
      <group ref={leftGlassRef} position={[0, 0, 0.02]}>
        <Box args={[0.68, 0.98, 0.04]}>
          <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} opacity={0.5} transparent />
        </Box>
      </group>
      {/* Sliding Glass Right */}
      <group ref={rightGlassRef} position={[0, 0, -0.02]}>
        <Box args={[0.68, 0.98, 0.04]}>
          <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} opacity={0.5} transparent />
        </Box>
      </group>
    </group>
  );
}

// ─── ADVANCED PROCEDURAL LUXURY FURNITURE ─────────────────────────────────
function RoomFurniture({ type, w, l, materials, floorTex }) {
  if (type === 'living') {
    return (
      <group position={[0, 0.02, 0]}>
        {/* Large slate area rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, l * 0.15]} receiveShadow>
          <planeGeometry args={[w * 0.7, l * 0.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        
        {/* Premium Luxury Sofa Suite */}
        <group position={[0, 0.175, l * 0.15]}>
          {/* Main Couch backrest and base */}
          <RoundedBox args={[w * 0.55, 0.35, 0.75]} radius={0.06} smoothness={4} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[w * 0.55, 0.75, 0.2]} position={[0, 0.2, 0.28]} radius={0.06} smoothness={4} castShadow>
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </RoundedBox>
          {/* Side Cushions */}
          <RoundedBox args={[0.2, 0.45, 0.7]} position={[-w * 0.27, 0.15, 0]} radius={0.04} smoothness={4} castShadow>
            <meshStandardMaterial color="#475569" />
          </RoundedBox>
          <RoundedBox args={[0.2, 0.45, 0.7]} position={[w * 0.27, 0.15, 0]} radius={0.04} smoothness={4} castShadow>
            <meshStandardMaterial color="#475569" />
          </RoundedBox>
        </group>
        
        {/* Coffee Table with gold frames */}
        <group position={[0, 0.125, l * 0.15 - 0.45]}>
          <Box args={[0.85, 0.25, 0.55]} castShadow>
            <meshStandardMaterial color="#8B5A2B" roughness={0.4} />
          </Box>
          {/* Gold edge profile */}
          <Box args={[0.89, 0.04, 0.59]} position={[0, 0.125, 0]} castShadow>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Box>
        </group>
        
        {/* Luxury Dinette Table Set in NE corner */}
        <group position={[0, 0.325, -l * 0.22]}>
          <Box args={[w * 0.45, 0.65, 0.8]} castShadow>
            <meshStandardMaterial color="#8B5A2B" roughness={0.4} />
          </Box>
          <Box args={[w * 0.47, 0.03, 0.84]} position={[0, 0.33, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Box>
          {/* Soft chairs */}
          {[-w * 0.16, w * 0.16].map((x, i) => (
            <group key={i} position={[x, -0.15, 0]}>
              <RoundedBox args={[0.32, 0.4, 0.32]} radius={0.02} castShadow>
                <meshStandardMaterial color="#334155" />
              </RoundedBox>
              <Box args={[0.03, 0.5, 0.32]} position={[x > 0 ? 0.15 : -0.15, 0.25, 0]}>
                <meshStandardMaterial color="#475569" />
              </Box>
            </group>
          ))}
        </group>

        {/* TV Console on Wall */}
        <Box args={[w * 0.5, 0.4, 0.3]} position={[0, 0.2, -l * 0.44]} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </Box>
        <Box args={[w * 0.38, 0.55, 0.05]} position={[0, 0.7, -l * 0.44]} castShadow>
          <meshStandardMaterial color="#09090b" roughness={0.1} metalness={0.8} />
        </Box>
        
        {/* Smart Split AC unit */}
        <Box args={[0.8, 0.22, 0.15]} position={[0, 1.3, -l * 0.48]} castShadow>
          <meshStandardMaterial color={materials?.electronics?.id === 'samsung' ? '#0f172a' : '#ffffff'} roughness={0.2} />
        </Box>
        
        {/* Modular Switches with glowing Wiring Indicator LED! */}
        <Box args={[0.12, 0.12, 0.02]} position={[-w * 0.48, 0.9, 0]} castShadow>
          <meshStandardMaterial color={materials?.switches?.color || "#ffffff"} roughness={0.1} />
        </Box>
        <Box args={[0.02, 0.02, 0.03]} position={[-w * 0.48, 0.9 + 0.03, 0.005]}>
          <meshBasicMaterial color={materials?.wiring?.color || "#ef4444"} />
        </Box>

        {/* Floating Wooden Staircase with Premium Metal Framing */}
        <group position={[-w * 0.38, 0, -l * 0.1]} rotation={[0, Math.PI / 2, 0]}>
          {Array.from({ length: 11 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              args={[0.65, 0.04, 0.22]}
              position={[0, idx * 0.18 + 0.09, -idx * 0.2]}
              radius={0.01}
              castShadow
            >
              <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
            </RoundedBox>
          ))}
          {/* Staircase Stringers (Gold metal frame for premium look) */}
          <Box args={[0.03, 0.03, 2.5]} position={[-0.3, 0.95, -1.0]} rotation={[0.7, 0, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.03, 0.03, 2.5]} position={[0.3, 0.95, -1.0]} rotation={[0.7, 0, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Box>
        </group>

        {/* Architectural support columns/pillars wrapped in premium design */}
        <group position={[-w * 0.15, 1.05, l * 0.35]}>
          <Box args={[0.22, 2.1, 0.22]} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </Box>
          <Box args={[0.25, 0.06, 0.25]} position={[0, -1.02, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[0.25, 0.06, 0.25]} position={[0, 1.02, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </Box>
        </group>
        <group position={[w * 0.15, 1.05, l * 0.35]}>
          <Box args={[0.22, 2.1, 0.22]} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </Box>
          <Box args={[0.25, 0.06, 0.25]} position={[0, -1.02, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[0.25, 0.06, 0.25]} position={[0, 1.02, 0]}>
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </Box>
        </group>
      </group>
    );
  }
  if (type === 'kitchen') {
    return (
      <group position={[0, 0.02, 0]}>
        {/* L-shaped counter slab */}
        <Box args={[w * 0.8, 0.75, 0.55]} position={[0, 0.375, -l * 0.2]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </Box>
        {/* Granite top */}
        <Box args={[w * 0.82, 0.04, 0.58]} position={[0, 0.77, -l * 0.2]} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.6} />
        </Box>

        {/* Premium Kitchen Island in center */}
        <group position={[0, 0.375, l * 0.18]}>
          <Box args={[w * 0.45, 0.75, 0.55]} castShadow>
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </Box>
          {/* Marble top overlay */}
          <Box args={[w * 0.48, 0.04, 0.58]} position={[0, 0.395, 0]} castShadow>
            <meshStandardMaterial color="#f5f0eb" roughness={0.15} metalness={0.1} />
          </Box>
          {/* Luxury Bar Stools */}
          {[[-w * 0.12, -0.15, 0.4], [w * 0.12, -0.15, 0.4]].map((pos, idx) => (
            <group key={idx} position={pos}>
              <Box args={[0.02, 0.45, 0.02]} position={[-0.1, 0, -0.1]}>
                <meshStandardMaterial color="#d4af37" metalness={0.9} />
              </Box>
              <Box args={[0.02, 0.45, 0.02]} position={[0.1, 0, -0.1]}>
                <meshStandardMaterial color="#d4af37" metalness={0.9} />
              </Box>
              <Box args={[0.02, 0.45, 0.02]} position={[-0.1, 0, 0.1]}>
                <meshStandardMaterial color="#d4af37" metalness={0.9} />
              </Box>
              <Box args={[0.02, 0.45, 0.02]} position={[0.1, 0, 0.1]}>
                <meshStandardMaterial color="#d4af37" metalness={0.9} />
              </Box>
              <RoundedBox args={[0.26, 0.04, 0.26]} position={[0, 0.24, 0]} radius={0.02}>
                <meshStandardMaterial color="#0f172a" />
              </RoundedBox>
            </group>
          ))}
        </group>

        {/* Premium Sink Bowl */}
        <Box args={[0.55, 0.02, 0.38]} position={[w * 0.15, 0.78, -l * 0.2]} castShadow>
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Gold/Jaquar Faucet */}
        <Box args={[0.03, 0.2, 0.03]} position={[w * 0.15, 0.88, -l * 0.2 - 0.12]} castShadow>
          <meshStandardMaterial color={materials?.utilities?.color || "#d4af37"} metalness={0.9} roughness={0.1} />
        </Box>

        {/* Refrigerator in Black Steel finish with visual water dispenser */}
        <group position={[-w * 0.3, 0.7, -l * 0.15]}>
          <Box args={[0.65, 1.4, 0.65]} castShadow>
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[0.25, 0.3, 0.02]} position={[0, 0.18, 0.33]}>
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.05} />
          </Box>
        </group>
      </group>
    );
  }
  if (type === 'master' || type === 'bed2') {
    return (
      <group position={[0, 0.02, 0]}>
        {/* Soft area rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -l * 0.05]} receiveShadow>
          <planeGeometry args={[w * 0.7, l * 0.7]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>

        {/* Premium Double Bed frame */}
        <group position={[0, 0.125, -l * 0.05]}>
          <RoundedBox args={[w * 0.55, 0.25, l * 0.55]} radius={0.02} castShadow>
            <meshStandardMaterial color="#5c3f30" roughness={0.8} />
          </RoundedBox>
          {/* Tufted Headboard */}
          <RoundedBox args={[w * 0.55, 0.88, 0.12]} position={[0, 0.44, -l * 0.28]} radius={0.03} castShadow>
            <meshStandardMaterial color="#4a3525" roughness={0.9} />
          </RoundedBox>
          {/* Mattress */}
          <RoundedBox args={[w * 0.52, 0.2, l * 0.52]} position={[0, 0.2, 0]} radius={0.02} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </RoundedBox>
          {/* Decorative Blanket folded */}
          <Box args={[w * 0.53, 0.22, l * 0.28]} position={[0, 0.21, l * 0.11]} castShadow>
            <meshStandardMaterial color={type === 'master' ? '#1e3a8a' : '#5b21b6'} roughness={0.8} />
          </Box>
          {/* Pillows */}
          <RoundedBox args={[w * 0.18, 0.06, 0.35]} position={[-w * 0.12, 0.325, -l * 0.2]} radius={0.02} castShadow>
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[w * 0.18, 0.06, 0.35]} position={[w * 0.12, 0.325, -l * 0.2]} radius={0.02} castShadow>
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </RoundedBox>
        </group>

        {/* Nightstands with glowing reading lamps */}
        {[[-w * 0.34, 0, -l * 0.25], [w * 0.34, 0, -l * 0.25]].map((pos, idx) => (
          <group key={idx} position={pos}>
            <Box args={[0.35, 0.35, 0.35]} position={[0, 0.175, 0]} castShadow>
              <meshStandardMaterial color="#5c3f30" roughness={0.7} />
            </Box>
            {/* Lamp base */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.01, 0.02, 0.1, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} />
            </mesh>
            {/* Lamp Shade (Glowing bulb mesh!) */}
            <mesh position={[0, 0.49, 0]}>
              <cylinderGeometry args={[0.06, 0.09, 0.12, 8]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.8} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Large Wardrobes with metal handles */}
        <Box args={[0.45, 1.4, l * 0.42]} position={[w * 0.4, 0.7, l * 0.2]} castShadow>
          <meshStandardMaterial color="#3e2723" roughness={0.7} />
        </Box>
        <Box args={[0.02, 1.35, 0.04]} position={[w * 0.4 - 0.23, 0.7, l * 0.2]} castShadow>
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </Box>

        {/* Modular Switches with glowing Wiring Indicator LED! */}
        <Box args={[0.12, 0.12, 0.02]} position={[-w * 0.4, 0.8, -l * 0.2]} castShadow>
          <meshStandardMaterial color={materials?.switches?.color || "#ffffff"} roughness={0.1} />
        </Box>
        <Box args={[0.02, 0.02, 0.03]} position={[-w * 0.4, 0.8 + 0.03, -l * 0.2 + 0.005]}>
          <meshBasicMaterial color={materials?.wiring?.color || "#ef4444"} />
        </Box>
      </group>
    );
  }
  if (type === 'bath1') {
    return (
      <group position={[0, 0.02, 0]}>
        {/* Bathtub with blue transparent water */}
        <group position={[0, 0.225, l * 0.22]}>
          <RoundedBox args={[w * 0.7, 0.45, 0.75]} radius={0.06} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </RoundedBox>
          <Box args={[w * 0.64, 0.02, 0.69]} position={[0, 0.185, 0]}>
            <meshStandardMaterial color="#38bdf8" roughness={0.05} opacity={0.6} transparent />
          </Box>
        </group>

        {/* Toilet Vanity Sink Cabinet with glowing illuminated mirror */}
        <group position={[-w * 0.2, 0, -l * 0.28]}>
          <Box args={[0.55, 0.7, 0.4]} position={[0, 0.35, 0]} castShadow>
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </Box>
          <Box args={[0.48, 0.1, 0.36]} position={[0, 0.75, 0]} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.05} />
          </Box>
          {/* Faucet spout */}
          <Box args={[0.03, 0.15, 0.03]} position={[0, 0.85, 0.1]} castShadow>
            <meshStandardMaterial color={materials?.utilities?.color || "#94a3b8"} metalness={0.9} roughness={0.1} />
          </Box>
          {/* Large Round Glowing Mirror */}
          <group position={[0, 1.25, -0.19]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Mirror LED glow halo */}
            <mesh scale={[1.08, 1.08, 1.0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} rotation={[Math.PI / 2, 0, 0]} />
              <meshBasicMaterial color="#fffbeb" />
            </mesh>
          </group>
        </group>

        {/* Modern Commode */}
        <Box args={[0.38, 0.4, 0.55]} position={[w * 0.24, 0.2, -l * 0.22]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </Box>
        <Box args={[0.38, 0.45, 0.22]} position={[w * 0.24, 0.425, -l * 0.22 - 0.16]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </Box>
      </group>
    );
  }
  if (type === 'pooja') {
    return (
      <group position={[0, 0.02, 0]}>
        {/* Golden Mandir Pedestal */}
        <Box args={[w * 0.6, 0.35, l * 0.6]} position={[0, 0.175, -l * 0.1]} castShadow>
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.6} />
        </Box>
        {/* Small Idol representation */}
        <Box args={[0.2, 0.3, 0.2]} position={[0, 0.5, -l * 0.1]} castShadow>
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Glowing Diya representation */}
        <mesh position={[0, 0.38, 0.14]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
      </group>
    );
  }
  return null;
}

// ─── OFFLINE-SAFE TEXT RENDERING ──────────────────────────────────────────
function OfflineSafeText({ text, position, rotation, fontSize = 0.24, color = "#0f172a" }) {
  const canvas = React.useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = 'bold 36px Arial, Helvetica, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width / 2, c.height / 2);
    return c;
  }, [text, color]);

  const texture = React.useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [canvas]);

  const aspect = 512 / 128;
  const w = fontSize * 5;
  const h = w / aspect;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── ROOM MESH ────────────────────────────────────────────────────────────
function Room({ room, wallColor, floorColor, doorColor, roofColor, materials, isSelected, onClick, doorOpen, onDoorClick, showRoof }) {
  const [windowOpen, setWindowOpen] = useState(false);
  const wallThickness = 0.24;
  const h = room.h || 2.8; // Dynamic ceiling height!

  const displayFloorColor = 
    room.id === 'bath1' ? '#cbd5e1' : 
    room.id === 'kitchen' ? '#475569' : 
    room.id === 'pooja' ? '#fffbeb' : 
    floorColor;

  const displayFloorId = 
    room.id === 'bath1' ? 'antiskid' : 
    room.id === 'kitchen' ? 'granite' : 
    room.id === 'pooja' ? 'marble' : 
    materials?.floor?.id;

  const floorTexture = useProceduralTexture('floor', displayFloorId, displayFloorColor);
  const wallTexture = useProceduralTexture('wall', materials?.wall?.id, wallColor || '#ffffff');

  const ceilingColor = roofColor || "#f5f5f5";
  const isFalseCeiling = materials?.roof?.id === 'false';

  return (
    <group position={[room.x, 0, room.z]} onClick={onClick}>
      {/* Floor with rich procedural texture */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.rw, room.rl]} />
        <meshStandardMaterial map={floorTexture} roughness={0.4} />
      </mesh>
 
      {/* Furniture */}
      <RoomFurniture type={room.id} w={room.rw} l={room.rl} materials={materials} floorTex={floorTexture} />
 
      {/* Cut-section Walls with Slate Caps and custom texture paint */}
      {/* Back wall */}
      <mesh castShadow position={[0, h / 2, -room.rl / 2]}>
        <boxGeometry args={[room.rw, h, wallThickness]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.01, -room.rl / 2]}>
        <boxGeometry args={[room.rw + 0.02, 0.02, wallThickness + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Left wall */}
      <mesh castShadow position={[-room.rw / 2, h / 2, 0]}>
        <boxGeometry args={[wallThickness, h, room.rl]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[-room.rw / 2, h + 0.01, 0]}>
        <boxGeometry args={[wallThickness + 0.02, 0.02, room.rl + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Right wall */}
      <mesh castShadow position={[room.rw / 2, h / 2, 0]}>
        <boxGeometry args={[wallThickness, h, room.rl]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[room.rw / 2, h + 0.01, 0]}>
        <boxGeometry args={[wallThickness + 0.02, 0.02, room.rl + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Front wall left segment */}
      <mesh castShadow position={[-room.rw / 4 - 0.1, h / 2, room.rl / 2]}>
        <boxGeometry args={[room.rw / 2 - 0.8, h, wallThickness]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[-room.rw / 4 - 0.1, h + 0.01, room.rl / 2]}>
        <boxGeometry args={[room.rw / 2 - 0.8 + 0.02, 0.02, wallThickness + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Front wall right segment */}
      <mesh castShadow position={[room.rw / 4 + 0.1, h / 2, room.rl / 2]}>
        <boxGeometry args={[room.rw / 2 - 0.8, h, wallThickness]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[room.rw / 4 + 0.1, h + 0.01, room.rl / 2]}>
        <boxGeometry args={[room.rw / 2 - 0.8 + 0.02, 0.02, wallThickness + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Front wall above door doorway */}
      <mesh castShadow position={[0, h - 0.05, room.rl / 2]}>
        <boxGeometry args={[1.2, 0.1, wallThickness]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.01, room.rl / 2]}>
        <boxGeometry args={[1.22, 0.02, wallThickness + 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Animated Door aligned flush on floor */}
      <AnimatedDoor
        position={[-0.5, 0, room.rl / 2]}
        color={doorColor}
        isOpen={doorOpen}
        onClick={(e) => { e.stopPropagation(); onDoorClick(); }}
      />
 
      {/* Sliding Window on back wall */}
      <AnimatedWindow
        position={[0, 0.9, -room.rl / 2 + 0.02]}
        rotation={[0, 0, 0]}
        isOpen={windowOpen}
        onClick={(e) => { e.stopPropagation(); setWindowOpen(!windowOpen); }}
      />
 
      {/* Sleek Glass Balcony Railing like the reference design */}
      {(room.id === 'living' || room.id === 'master') && (
        <group position={[0, 0.45, room.rl / 2 + 0.03]}>
          <Box args={[room.rw, 0.9, 0.02]} castShadow receiveShadow>
            <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} transparent opacity={0.35} />
          </Box>
          <Box args={[room.rw + 0.02, 0.04, 0.05]} position={[0, 0.47, 0]} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.3} />
          </Box>
        </group>
      )}

      {/* Cove False Ceiling with Glowing Cove LEDs */}
      {isFalseCeiling && (
        <group position={[0, h - 0.08, 0]}>
          {/* Main ceiling plaster border */}
          <Box args={[room.rw - 0.12, 0.05, room.rl - 0.12]} castShadow>
            <meshStandardMaterial color={ceilingColor} roughness={0.9} />
          </Box>
          {/* Cove light strip in center with warm emissive glow */}
          <Box args={[room.rw - 0.28, 0.01, room.rl - 0.28]}>
            <meshStandardMaterial color="#fffbeb" emissive="#fef08a" emissiveIntensity={2.2} roughness={0.9} />
          </Box>
        </group>
      )}

      {/* Flat concrete ceiling slab when roof is toggled on (dollhouse slab) */}
      {showRoof && !isFalseCeiling && (
        <mesh position={[0, h - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[room.rw, room.rl]} />
          <meshStandardMaterial color={roofColor || "#cbd5e1"} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Offline-Safe Room Label */}
      <OfflineSafeText
        text={room.name}
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color="#0f172a"
      />
      <OfflineSafeText
        text={`${room.direction} quadrant`}
        position={[0, 0.08, 0.28]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.14}
        color="#475569"
      />
 
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[room.rw - 0.08, room.rl - 0.08]} />
          <meshStandardMaterial color="#2563eb" opacity={0.2} transparent />
        </mesh>
      )}
    </group>
  );
}

// ─── EXTERIOR HOUSE ──────────────────────────────────────────────────────
function ExteriorHouse({ data, doorColor, wallColor, roofColor, houseName, lightingMode }) {
  const length = (Number(data.plotLength) || 40) * 0.09;
  const width = (Number(data.plotWidth) || 60) * 0.09;
  const height = 4.0; // Dynamic scale height for Duplex!

  return (
    <group position={[0, height / 2, 0]}>
      {/* Ground Floor Block */}
      <Box args={[width * 0.96, height * 0.46, length * 0.96]} position={[0, -height * 0.24, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={wallColor || '#faf5e4'} roughness={0.8} />
      </Box>

      {/* Ground Floor Wood Accent Column */}
      <Box args={[0.3, height * 0.46, 0.3]} position={[-width * 0.44, -height * 0.24, length * 0.45]} castShadow>
        <meshStandardMaterial color="#8b5a2b" roughness={0.4} />
      </Box>

      {/* Ground Floor Entrance Porch / Canopy */}
      <Box args={[width * 0.4, 0.08, 1.2]} position={[-width * 0.1, -height * 0.1, length * 0.5]} castShadow>
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </Box>
      <Box args={[0.1, height * 0.38, 0.1]} position={[-width * 0.28, -height * 0.29, length * 0.55]} castShadow>
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </Box>

      {/* Ground Floor Windows */}
      <Box args={[width * 0.3, height * 0.28, 0.08]} position={[width * 0.2, -height * 0.2, length * 0.485]} castShadow>
        <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} opacity={0.6} transparent />
      </Box>
      {/* Black Window Frame trim */}
      <Box args={[width * 0.31, height * 0.29, 0.04]} position={[width * 0.2, -height * 0.2, length * 0.48]}>
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </Box>

      {/* First Floor Block (Duplex Level) */}
      <Box args={[width * 0.96, height * 0.46, length * 0.8]} position={[0, height * 0.24, -length * 0.08]} castShadow receiveShadow>
        <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.8} />
      </Box>

      {/* First Floor Balcony Deck (extended forward) */}
      <Box args={[width * 0.9, 0.08, length * 0.16]} position={[0, 0.02, length * 0.4]} castShadow receiveShadow>
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </Box>
      
      {/* First Floor Balcony Glass Railing */}
      <group position={[0, 0.45, length * 0.47]}>
        <Box args={[width * 0.88, 0.8, 0.02]} castShadow receiveShadow>
          <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} transparent opacity={0.35} />
        </Box>
        <Box args={[width * 0.9, 0.03, 0.04]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </Box>
      </group>

      {/* First Floor Sliding Glass Doors to Balcony */}
      <Box args={[width * 0.35, height * 0.3, 0.06]} position={[-width * 0.1, height * 0.2, length * 0.315]} castShadow>
        <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.9} opacity={0.5} transparent />
      </Box>
      <Box args={[width * 0.36, height * 0.31, 0.03]} position={[-width * 0.1, height * 0.2, length * 0.31]}>
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </Box>

      {/* Main Entrance Door */}
      <Box args={[1.1, 2.1, 0.08]} position={[-width * 0.1, -height * 0.25, length * 0.48]} castShadow>
        <meshStandardMaterial color={doorColor || '#5c3317'} roughness={0.5} />
      </Box>

      {/* --- ROOF TERRACE SECTION --- */}
      {/* Flat concrete roof slab */}
      <Box args={[width * 1.0, 0.1, length * 1.0]} position={[0, height * 0.48, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
      </Box>

      {/* Parapet walls around the roof terrace */}
      {/* Front Parapet */}
      <Box args={[width * 1.0, 0.7, 0.08]} position={[0, height * 0.48 + 0.35, length * 0.49]} castShadow>
        <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.9} />
      </Box>
      {/* Back Parapet */}
      <Box args={[width * 1.0, 0.7, 0.08]} position={[0, height * 0.48 + 0.35, -length * 0.49]} castShadow>
        <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.9} />
      </Box>
      {/* Left Parapet */}
      <Box args={[0.08, 0.7, length * 1.0]} position={[-width * 0.49, height * 0.48 + 0.35, 0]} castShadow>
        <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.9} />
      </Box>
      {/* Right Parapet */}
      <Box args={[0.08, 0.7, length * 1.0]} position={[width * 0.49, height * 0.48 + 0.35, 0]} castShadow>
        <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.9} />
      </Box>

      {/* Staircase Head Cabin on Roof */}
      <group position={[width * 0.2, height * 0.48 + 1.1, -length * 0.2]}>
        <Box args={[1.8, 2.2, 1.8]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor || '#ffffff'} roughness={0.8} />
        </Box>
        {/* Cabin Roof slab */}
        <Box args={[2.0, 0.08, 2.0]} position={[0, 1.14, 0]} castShadow>
          <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
        </Box>
        {/* Blue Cylindrical Sump Overhead Water Tank */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.9, 16]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* --- GLOWING NAMEPLATE ON PORCH PILLAR --- */}
      <group position={[-width * 0.26, -height * 0.15, length * 0.51]} rotation={[0, 0, 0]}>
        {/* Glass Backplate */}
        <Box args={[1.6, 0.45, 0.04]} castShadow>
          <meshStandardMaterial color="#ffffff" opacity={0.6} transparent roughness={0.1} metalness={0.9} />
        </Box>
        {/* Luxury Gold Border Trim */}
        <Box args={[1.66, 0.51, 0.02]} position={[0, 0, -0.015]}>
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Glowing LED light bar above the plate */}
        <Box args={[1.5, 0.04, 0.06]} position={[0, 0.24, 0.02]}>
          <meshStandardMaterial color="#fffbeb" emissive={lightingMode === 'night' ? '#fffbeb' : '#cccccc'} emissiveIntensity={2.5} />
        </Box>
        {/* Offline-Safe House Name Text */}
        <OfflineSafeText
          text={houseName || "PADMAJA RETREAT"}
          position={[0, 0, 0.03]}
          rotation={[0, 0, 0]}
          fontSize={0.085}
          color={lightingMode === 'night' ? '#d4af37' : '#0f172a'}
        />
      </group>

      {/* Exterior spotlights washing columns in Night Mode */}
      {lightingMode === 'night' && (
        <>
          <pointLight position={[-width * 0.4, -height * 0.4, length * 0.48]} intensity={2.5} distance={3} color="#fbbf24" />
          <pointLight position={[width * 0.4, -height * 0.4, length * 0.48]} intensity={2.5} distance={3} color="#fbbf24" />
        </>
      )}
    </group>
  );
}

// ─── CAMERA CONTROLLER (Smooth eye-level walkthrough transitions) ───────────
function CameraController({ selectedRoom, viewMode, controlsRef, walkOffset }) {
  const { camera } = useThree();

  useFrame(() => {
    let targetX = 0, targetY = 1.2, targetZ = 0;
    let camX = 0, camY = 10, camZ = 12;

    if (viewMode === 'exterior') {
      targetX = 0; targetY = 1.2; targetZ = 0;
      camX = 13; camY = 9; camZ = 14;
    } else if (viewMode === 'topdown') {
      targetX = 0; targetY = 0.09; targetZ = 0;
      camX = 0; camY = 18; camZ = 0.05;
    } else if (viewMode === 'interior') {
      if (selectedRoom) {
        // Glide CAMERA directly INSIDE the room at standard eye level (1.3m) with walkOffset
        targetX = selectedRoom.x + (walkOffset?.x || 0);
        targetY = 1.1;
        targetZ = selectedRoom.z + (walkOffset?.z || 0);
        camX = selectedRoom.x + (walkOffset?.x || 0) - 0.15;
        camY = 1.35;
        camZ = selectedRoom.z + (walkOffset?.z || 0) + 0.15;
      } else {
        targetX = 0; targetY = 1.2; targetZ = 0;
        camX = 0; camY = 10; camZ = 12;
      }
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, 0.06);

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.06);
      controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.06);
      controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, targetZ, 0.06);
      controlsRef.current.update();
    }
  });

  return null;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────
export default function HouseViewer3D({ data, customRooms, materials, setMaterials, liveCosts, budget }) {
  const [viewMode, setViewMode] = useState('interior');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState(null);
  const [openDoors, setOpenDoors] = useState({});
  const [houseName, setHouseName] = useState("PADMAJA RETREAT");
  const [ceilingHeight, setCeilingHeight] = useState(3.0);
  const [lightingMode, setLightingMode] = useState("day");
  const [showRoof, setShowRoof] = useState(true);
  const [walkOffset, setWalkOffset] = useState({ x: 0, z: 0 });
  const controlsRef = useRef();

  const length = Number(data?.plotLength) || 40;
  const width = Number(data?.plotWidth) || 60;
  
  const rooms = React.useMemo(() => {
    if (customRooms && customRooms.length > 0) {
      return customRooms.map(r => {
        let col = 0;
        let rowIdx = 0;

        if (r.direction.includes('W')) col = -1;
        else if (r.direction.includes('E')) col = 1;
        else col = 0;

        if (r.direction.includes('N')) rowIdx = -1;
        else if (r.direction.includes('S')) rowIdx = 1;
        else rowIdx = 0;

        const scaleW = width * 0.09;
        const scaleL = length * 0.09;

        const xPos = col * (scaleW * 0.35);
        const zPos = rowIdx * (scaleL * 0.35);

        return {
          id: r.id,
          name: r.name,
          direction: r.direction,
          color: r.color || '#cbd5e1',
          x: xPos,
          z: zPos,
          rw: r.rw * 0.09,
          rl: r.rl * 0.09,
          h: r.id === 'bath1' || r.id === 'pooja' ? ceilingHeight * 0.85 : ceilingHeight
        };
      });
    }
    return getRooms(length, width).map(r => ({
      ...r,
      h: r.id === 'bath1' || r.id === 'pooja' ? ceilingHeight * 0.85 : ceilingHeight
    }));
  }, [customRooms, length, width, ceilingHeight]);

  const enterRoomEyeLevel = (room) => {
    setSelectedRoom(room);
    setViewMode('interior');
    setWalkOffset({ x: 0, z: 0 });
  };

  const handleWalk = (direction) => {
    const step = 0.4;
    setWalkOffset(prev => {
      let nx = prev.x;
      let nz = prev.z;
      if (direction === 'forward') nz -= step;
      if (direction === 'backward') nz += step;
      if (direction === 'left') nx -= step;
      if (direction === 'right') nx += step;
      return { x: nx, z: nz };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'interior' || !selectedRoom) return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handleWalk('forward');
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') handleWalk('backward');
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handleWalk('left');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handleWalk('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedRoom]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', margin: '0 0 2px', fontWeight: '700' }}>3D Premium Interactive House walk-through</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {viewMode === 'interior' ? '⚡ Click any room below to enter walkthrough! Toggle doors/windows, customize materials live. Use W/A/S/D to walk.' : '🏠 Rotate & inspect design from different angles.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'interior', label: '🚪 Walk Inside', icon: <Layers size={14} /> },
            { id: 'exterior', label: '🏠 Exterior View', icon: <Eye size={14} /> },
            { id: 'topdown', label: '🗺️ Top-Down Plan', icon: <Grid3x3 size={14} /> },
          ].map(m => (
            <button key={m.id} onClick={() => { setViewMode(m.id); setSelectedRoom(null); setWalkOffset({ x: 0, z: 0 }); }}
              style={{
                padding: '8.5px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                border: `1px solid ${viewMode === m.id ? '#2563eb' : 'var(--border-color)'}`,
                backgroundColor: viewMode === m.id ? '#2563eb' : 'transparent',
                color: viewMode === m.id ? 'white' : 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              {m.icon} {m.label}
            </button>
          ))}
          <button onClick={() => store.enterAR()}
            style={{ padding: '8.5px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={14} /> AR View
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', height: '540px' }}>
        {/* 3D Canvas */}
        <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
          <Canvas shadows camera={{ position: [0, 10, 12], fov: 50 }}>
            <XR store={store}>
              {lightingMode === 'night' ? (
                <>
                  <color attach="background" args={['#0f172a']} />
                  <ambientLight intensity={0.2} color="#1e1b4b" />
                  <directionalLight position={[15, 25, 15]} intensity={0.12} color="#38bdf8" />
                  <hemisphereLight skyColor="#020617" groundColor="#1e1b4b" intensity={0.4} />
                </>
              ) : (
                <>
                  <color attach="background" args={['#f8fafc']} />
                  <ambientLight intensity={1.2} color="#fffbeb" />
                  <directionalLight position={[15, 25, 15]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
                  <pointLight position={[-10, 8, -10]} intensity={0.6} color="#38bdf8" />
                  <hemisphereLight skyColor="#ffffff" groundColor="#455a64" intensity={0.8} />
                </>
              )}

              <Suspense fallback={null}>
                {/* Yard/Plot Base */}
                <Plane args={[95, 95]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                  <meshStandardMaterial color={lightingMode === 'night' ? '#1e293b' : '#f1f5f9'} roughness={0.9} />
                </Plane>

                {/* Plot concrete platform */}
                <Box args={[(width * 0.09) + 1, 0.08, (length * 0.09) + 1]} position={[0, 0.04, 0]} receiveShadow>
                  <meshStandardMaterial color={lightingMode === 'night' ? '#334155' : '#ffffff'} roughness={0.8} />
                </Box>

                {/* Grid helper */}
                <gridHelper args={[50, 50, '#cbd5e1', '#f1f5f9']} position={[0, 0.09, 0]} />

                {viewMode === 'exterior' ? (
                  <ExteriorHouse data={data} doorColor={materials.door.color} wallColor={materials.wall.color} roofColor={materials.roof.color} houseName={houseName} lightingMode={lightingMode} />
                ) : (
                  rooms.map(room => (
                    <Room
                      key={room.id}
                      room={room}
                      wallColor={materials.wall.color}
                      floorColor={materials.floor.color}
                      doorColor={materials.door.color}
                      roofColor={materials.roof.color}
                      materials={materials}
                      isSelected={selectedRoom?.id === room.id}
                      onClick={() => enterRoomEyeLevel(room)}
                      doorOpen={!!openDoors[room.id]}
                      onDoorClick={() => setOpenDoors(d => ({ ...d, [room.id]: !d[room.id] }))}
                      showRoof={showRoof}
                    />
                  ))
                )}

                {/* Active Spotlights in Night Mode inside all rooms */}
                {lightingMode === 'night' && viewMode !== 'exterior' && rooms.map(r => (
                  <pointLight
                    key={`light-${r.id}`}
                    position={[r.x, r.h - 0.2, r.z]}
                    intensity={1.8}
                    distance={8}
                    decay={2}
                    color="#fbbf24"
                    castShadow
                  />
                ))}

                {/* Animated Smooth Camera transitions */}
                <CameraController selectedRoom={selectedRoom} viewMode={viewMode} controlsRef={controlsRef} walkOffset={walkOffset} />
              </Suspense>

              <OrbitControls
                ref={controlsRef}
                enablePan enableZoom enableRotate
                minPolarAngle={viewMode === 'topdown' ? 0 : 0.05}
                maxPolarAngle={viewMode === 'topdown' ? 0.05 : Math.PI / 2 - 0.05}
              />
            </XR>
          </Canvas>

          {/* Facing Compass Indicator */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'white', border: '2px solid #2563eb', flexDirection: 'column', lineHeight: '1.2', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ color: '#ef4444', fontWeight: '800' }}>N ↑</div>
            <div style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 'bold' }}>{data?.plotFacing || 'East'}</div>
          </div>

          {/* Floating Budget Customizer HUD */}
          {liveCosts && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '220px', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(15,23,42,0.85)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Live Budget HUD</span>
                <span style={{ fontSize: '0.62rem', backgroundColor: liveCosts.adjustedTotal / 100000 <= budget ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: liveCosts.adjustedTotal / 100000 <= budget ? '#4ade80' : '#f87171', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {liveCosts.adjustedTotal / 100000 <= budget ? 'ON TRACK' : 'OVER BUDGET'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Dynamic Cost:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>
                  ₹{(liveCosts.adjustedTotal / 100000).toFixed(2)} Lakhs
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>
                  Target Budget: ₹{budget} Lakhs
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (liveCosts.adjustedTotal / 100000) / budget * 100)}%`, height: '100%', backgroundColor: liveCosts.adjustedTotal / 100000 <= budget ? '#22c55e' : '#ef4444', borderRadius: '3px' }} />
              </div>

              {/* Active Premium Selections */}
              <div style={{ fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                <div style={{ fontWeight: 'bold', color: '#cbd5e1' }}>Premium Upgrades:</div>
                {materials.floor.id !== 'vitrified' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
                    <span>✨ Floor: {materials.floor.label}</span>
                    <span>+{materials.floor.price}</span>
                  </div>
                )}
                {materials.wall.id !== 'cream' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
                    <span>✨ Wall: {materials.wall.label}</span>
                    <span>+{materials.wall.price}</span>
                  </div>
                )}
                {materials.door.id !== 'pvc' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
                    <span>✨ Door: {materials.door.label}</span>
                    <span>+{materials.door.price}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Walk-Inside Navigation Toolbar */}
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', backgroundColor: 'rgba(15,23,42,0.85)', padding: '6px 10px', borderRadius: '10px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 'bold', alignSelf: 'center', marginRight: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📍 Jump Inside:
            </span>
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => enterRoomEyeLevel(r)}
                style={{
                  padding: '5px 9px', borderRadius: '6px', border: `1px solid ${selectedRoom?.id === r.id ? '#2563eb' : 'rgba(255,255,255,0.15)'}`,
                  backgroundColor: selectedRoom?.id === r.id ? '#2563eb' : 'transparent',
                  color: 'white', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {r.name}
              </button>
            ))}
            {selectedRoom && (
              <button
                onClick={() => setSelectedRoom(null)}
                style={{
                  padding: '5px 9px', borderRadius: '6px', border: 'none',
                  backgroundColor: '#ef4444', color: 'white', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Reset View
              </button>
            )}
          </div>

          {/* On-Screen direction controls Walk Pad */}
          {viewMode === 'interior' && selectedRoom && (
            <div style={{ position: 'absolute', bottom: '80px', right: '12px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.85)', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '2px', textTransform: 'uppercase' }}>🎮 Walk Pad</div>
              <button onClick={() => handleWalk('forward')} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>▲</button>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => handleWalk('left')} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>◀</button>
                <button onClick={() => handleWalk('backward')} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>▼</button>
                <button onClick={() => handleWalk('right')} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>▶</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Room Info & Material Selector */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          
          {/* 3D Structure, Lighting & Customization Card */}
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚙️ Duplex Settings</p>
            
            {/* House Name Input */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>🏡 Custom Nameplate Text:</label>
              <input
                type="text"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value.toUpperCase())}
                placeholder="Enter house name..."
                style={{
                  width: '100%', padding: '6.5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.75rem', fontWeight: 'bold',
                  outline: 'none'
                }}
              />
            </div>

            {/* Ceiling Height Slider */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📐 Ceiling Height:</span>
                <span style={{ color: '#2563eb', fontWeight: '800' }}>{ceilingHeight.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="2.4"
                max="4.2"
                step="0.2"
                value={ceilingHeight}
                onChange={(e) => setCeilingHeight(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
              />
            </div>

            {/* Lighting Mode Selector & Roof Slab Toggle */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>💡 Lighting:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['day', 'night'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setLightingMode(mode)}
                      style={{
                        flex: 1, padding: '6px 4px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer',
                        border: `1px solid ${lightingMode === mode ? '#2563eb' : 'var(--border-color)'}`,
                        backgroundColor: lightingMode === mode ? '#2563eb' : 'transparent',
                        color: lightingMode === mode ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s'
                      }}
                    >
                      {mode === 'day' ? '☀️ Day' : '🌙 Night'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ width: '90px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>🏠 Roof Slab:</span>
                <button
                  onClick={() => setShowRoof(r => !r)}
                  style={{
                    width: '100%', padding: '6px 4px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer',
                    border: `1px solid ${showRoof ? '#2563eb' : 'var(--border-color)'}`,
                    backgroundColor: showRoof ? '#2563eb' : 'transparent',
                    color: showRoof ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s'
                  }}
                >
                  {showRoof ? '🟢 Shown' : '🔴 Hidden'}
                </button>
              </div>
            </div>
          </div>

          {/* Current Materials Summary */}
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Real-Time 3D Customizer</p>
            {Object.entries(materials).map(([type, mat]) => (
              <div key={type} onClick={() => setSelectedMaterialType(type)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', backgroundColor: selectedMaterialType === type ? 'rgba(37,99,235,0.06)' : 'var(--bg-color)', border: `1px solid ${selectedMaterialType === type ? '#2563eb' : 'var(--border-color)'}`, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: mat.color, border: '1px solid rgba(0,0,0,0.15)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize' }}>{type}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{mat.label}</div>
                  </div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>

          {/* Material Options Panel */}
          {selectedMaterialType && (
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid #2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', margin: 0 }}>
                  Choose {selectedMaterialType}
                </p>
                <button onClick={() => setSelectedMaterialType(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
              {MATERIAL_OPTIONS[selectedMaterialType]?.map(opt => (
                <div key={opt.id} onClick={() => setMaterials(m => ({ ...m, [selectedMaterialType]: opt }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', backgroundColor: materials[selectedMaterialType]?.id === opt.id ? 'rgba(37,99,235,0.08)' : 'var(--bg-color)', border: `1px solid ${materials[selectedMaterialType]?.id === opt.id ? '#2563eb' : 'var(--border-color)'}`, transition: 'all 0.15s' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: opt.color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success-color)' }}>{opt.price}</div>
                  </div>
                  {materials[selectedMaterialType]?.id === opt.id && <Check size={14} color="#2563eb" />}
                </div>
              ))}
            </div>
          )}

          {/* Room Info */}
          {selectedRoom && (
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>📍 Walk-Inside Active</p>
              <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '700' }}>{selectedRoom.name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 10px', lineHeight: '1.4' }}>
                Vastu: Placed correctly in the <strong>{selectedRoom.direction}</strong> quadrant. Rotate view by dragging, walk using WASD.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => setOpenDoors(d => ({ ...d, [selectedRoom.id]: !d[selectedRoom.id] }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'rgba(37,99,235,0.06)', border: '1px solid #2563eb', color: '#2563eb', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {openDoors[selectedRoom.id] ? '🚪 Close Door' : '🚪 Open Door'}
                </button>
                <button onClick={() => setSelectedRoom(null)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  🚶 Step Outside (Dollhouse View)
                </button>
              </div>
            </div>
          )}

          {/* Legend */}
          {viewMode === 'interior' && !selectedRoom && (
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>💡 Dollhouse Walkthrough guide</p>
              {[
                ['Click door', 'Toggle open/close'],
                ['Click window', 'Slide window open/close'],
                ['Click room name', 'Glides inside at eye-level'],
                ['Left click drag', 'Orbit around / rotate camera'],
                ['Scroll wheel', 'Walk in / zoom closer'],
              ].map(([action, desc]) => (
                <div key={action} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#2563eb', fontWeight: '700', minWidth: '92px' }}>{action}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
