import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Attack arcs between lat/lng pairs (origin → target)
const ATTACK_PATHS = [
  { from: [55.75, 37.62],   to: [19.07, 72.87],  color: '#f43f5e' }, // Russia → Mumbai
  { from: [6.52, 3.37],     to: [12.97, 77.59],  color: '#fb923c' }, // Nigeria → Bangalore
  { from: [51.50, -0.12],   to: [28.63, 77.21],  color: '#f43f5e' }, // London → Delhi
  { from: [25.20, 55.27],   to: [22.55, 88.36],  color: '#facc15' }, // Dubai → Kolkata
  { from: [1.35, 103.82],   to: [13.08, 80.27],  color: '#fb923c' }, // Singapore → Chennai
  { from: [37.77, -122.42], to: [19.07, 72.87],  color: '#a78bfa' }, // USA → Mumbai
];

function latLngToVec3(lat, lng, r = 1.52) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function buildArcCurve(from, to) {
  const p0 = latLngToVec3(from[0], from[1]);
  const p1 = latLngToVec3(to[0], to[1]);
  const mid = p0.clone().add(p1).multiplyScalar(0.5);
  const midR = mid.length();
  mid.normalize().multiplyScalar(midR + 0.6);
  return new THREE.QuadraticBezierCurve3(p0, mid, p1);
}

function AttackArc({ from, to, color }) {
  const ref = useRef();
  const progressRef = useRef(Math.random());
  const curve = useMemo(() => buildArcCurve(from, to), [from, to]);
  const points = useMemo(() => curve.getPoints(60), [curve]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.4) % 1;
    if (ref.current) {
      // animate dash offset to simulate packet flying
      ref.current.material.dashOffset = -progressRef.current * 4;
    }
  });

  return (
    <line ref={ref} geometry={geo}>
      <lineDashedMaterial
        color={color}
        dashSize={0.08}
        gapSize={0.04}
        linewidth={2}
        transparent
        opacity={0.85}
      />
    </line>
  );
}

function Pulse({ lat, lng, color }) {
  const meshRef = useRef();
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta * 2.5;
    if (meshRef.current) {
      const scale = 1 + 0.5 * Math.abs(Math.sin(t.current));
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.opacity = 0.8 - 0.5 * Math.abs(Math.sin(t.current));
    }
  });

  const pos = latLngToVec3(lat, lng, 1.54);
  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

function Globe() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={ref}>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhongMaterial
          color="#0f172a"
          emissive="#1e3a5f"
          emissiveIntensity={0.3}
          transparent
          opacity={0.95}
          wireframe={false}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.51, 32, 32]} />
        <meshBasicMaterial color="#1e40af" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.58, 64, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Attack arcs */}
      {ATTACK_PATHS.map((arc, i) => (
        <AttackArc key={i} from={arc.from} to={arc.to} color={arc.color} />
      ))}

      {/* Origin pulses */}
      {ATTACK_PATHS.map((arc, i) => (
        <Pulse key={i} lat={arc.from[0]} lng={arc.from[1]} color={arc.color} />
      ))}
      {/* Target pulses — India cities */}
      <Pulse lat={19.07} lng={72.87} color="#22d3ee" />
      <Pulse lat={12.97} lng={77.59} color="#22d3ee" />
      <Pulse lat={28.63} lng={77.21} color="#22d3ee" />
      <Pulse lat={13.08} lng={80.27} color="#22d3ee" />
    </group>
  );
}

export default function ThreatGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#818cf8" />
      <Stars radius={60} depth={40} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <Globe />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}
