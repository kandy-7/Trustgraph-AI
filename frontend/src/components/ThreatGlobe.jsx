import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// Attack routes: origin country/city → target India city.
// Each endpoint is named so it can be shown on hover.
// ─────────────────────────────────────────────────────────────
const ROUTES = [
  { from: { name: 'Moscow, Russia',        lat: 55.75, lng: 37.62 },  to: { name: 'Mumbai, India',    lat: 19.07, lng: 72.87 }, color: '#f43f5e', threat: 'Credential Stuffing' },
  { from: { name: 'Lagos, Nigeria',        lat: 6.52,  lng: 3.37 },   to: { name: 'Bengaluru, India', lat: 12.97, lng: 77.59 }, color: '#fb923c', threat: 'Money Mule Network' },
  { from: { name: 'London, United Kingdom',lat: 51.50, lng: -0.12 },  to: { name: 'New Delhi, India', lat: 28.63, lng: 77.21 }, color: '#a78bfa', threat: 'VPN Exit Node' },
  { from: { name: 'Dubai, UAE',            lat: 25.20, lng: 55.27 },  to: { name: 'Kolkata, India',   lat: 22.55, lng: 88.36 }, color: '#facc15', threat: 'Credential Broker' },
  { from: { name: 'Singapore',             lat: 1.35,  lng: 103.82 }, to: { name: 'Chennai, India',   lat: 13.08, lng: 80.27 }, color: '#06b6d4', threat: 'Phishing Infrastructure' },
  { from: { name: 'San Francisco, USA',    lat: 37.77, lng: -122.42 },to: { name: 'Mumbai, India',    lat: 19.07, lng: 72.87 }, color: '#818cf8', threat: 'Bot Traffic' },
];

// Local first (bundled in /public, always available), CDN as a fallback.
const EARTH_TEXTURES = [
  '/earth-blue-marble.jpg',
  'https://unpkg.com/three-globe@2.45.2/example/img/earth-blue-marble.jpg',
];
const GLOBE_R = 1.5;
const MARKER_R = GLOBE_R + 0.015;

// Convert geographic coords to a point on the sphere surface.
function latLngToVec3(lat, lng, r = GLOBE_R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// A curved arc that bows outward from the surface (higher for longer routes).
function buildArcCurve(from, to) {
  const p0 = latLngToVec3(from.lat, from.lng, MARKER_R);
  const p1 = latLngToVec3(to.lat, to.lng, MARKER_R);
  const mid = p0.clone().add(p1).multiplyScalar(0.5);
  const lift = 0.35 + p0.distanceTo(p1) * 0.35;
  mid.normalize().multiplyScalar(GLOBE_R + lift);
  return new THREE.QuadraticBezierCurve3(p0, mid, p1);
}

const TOOLTIP_STYLE = {
  transform: 'translateY(-150%)',
  whiteSpace: 'nowrap',
  background: 'rgba(2,6,23,0.92)',
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#e2e8f0',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  lineHeight: 1.3,
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(6px)',
};

// Robustly load the Earth texture: try each source in order, fall back to a
// plain globe only if all sources fail (e.g. fully offline).
function useEarthTexture(urls) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const tryLoad = (i) => {
      if (!alive || i >= urls.length) return;
      loader.load(
        urls[i],
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          if (alive) setTexture(tex);
        },
        undefined,
        () => tryLoad(i + 1), // this source failed → try the next
      );
    };

    tryLoad(0);
    return () => { alive = false; };
  }, [urls]);
  return texture;
}

// ── One attack arc + a packet travelling from origin → target ──
function AttackArc({ from, to, color }) {
  const curve = useMemo(() => buildArcCurve(from, to), [from, to]);
  const points = useMemo(() => curve.getPoints(64), [curve]);
  const packetRef = useRef();
  const progress = useRef(Math.random());

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.22) % 1;
    if (packetRef.current) packetRef.current.position.copy(curve.getPointAt(progress.current));
  });

  return (
    <>
      <Line points={points} color={color} lineWidth={1.4} transparent opacity={0.55} />
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

// ── A hoverable location marker that reveals its place name ──
function Marker({ position, color, label, sublabel, onHoverChange }) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef();
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta * 2.4;
    if (ringRef.current) {
      const pulse = Math.abs(Math.sin(t.current));
      ringRef.current.scale.setScalar(1 + 0.9 * pulse);
      ringRef.current.material.opacity = 0.45 * (1 - pulse);
    }
  });

  const enter = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHoverChange(true);
    document.body.style.cursor = 'pointer';
  };
  const leave = () => {
    setHovered(false);
    onHoverChange(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position}>
      {/* pulsing halo */}
      <mesh ref={ringRef}>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* solid core */}
      <mesh scale={hovered ? 1.6 : 1}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* enlarged invisible hit area for easy hovering */}
      <mesh onPointerOver={enter} onPointerOut={leave}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered && (
        <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div style={TOOLTIP_STYLE}>
            <div style={{ fontWeight: 700 }}>{label}</div>
            {sublabel && (
              <div style={{ marginTop: 2, fontSize: 10.5, color, opacity: 0.95 }}>{sublabel}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe() {
  const groupRef = useRef();
  const earthMap = useEarthTexture(EARTH_TEXTURES);
  const [hoverCount, setHoverCount] = useState(0);

  // Pause auto-rotation while any marker is hovered (easier to read).
  useFrame((_, delta) => {
    if (groupRef.current && hoverCount === 0) groupRef.current.rotation.y += delta * 0.05;
  });

  const onHoverChange = (isHovering) =>
    setHoverCount((c) => Math.max(0, c + (isHovering ? 1 : -1)));

  // Unique markers: threat origins + protected India targets.
  const markers = useMemo(() => {
    const map = new Map();
    ROUTES.forEach((r) => {
      if (!map.has(r.from.name)) {
        map.set(r.from.name, { ...r.from, color: r.color, sublabel: `Origin · ${r.threat}` });
      }
      if (!map.has(r.to.name)) {
        map.set(r.to.name, { ...r.to, color: '#22d3ee', sublabel: 'Protected · Target' });
      }
    });
    return Array.from(map.values());
  }, []);

  return (
    <group ref={groupRef}>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, 64, 64]} />
        {earthMap ? (
          <meshPhongMaterial map={earthMap} shininess={6} specular="#1a2a44" />
        ) : (
          <meshPhongMaterial color="#0f2038" emissive="#12324f" emissiveIntensity={0.35} />
        )}
      </mesh>

      {/* Faint graticule + atmosphere glow */}
      <mesh>
        <sphereGeometry args={[GLOBE_R + 0.005, 36, 36]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_R + 0.08, 64, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {ROUTES.map((r, i) => (
        <AttackArc key={i} from={r.from} to={r.to} color={r.color} />
      ))}

      {markers.map((m) => (
        <Marker
          key={m.name}
          position={latLngToVec3(m.lat, m.lng, MARKER_R)}
          color={m.color}
          label={m.name}
          sublabel={m.sublabel}
          onHoverChange={onHoverChange}
        />
      ))}
    </group>
  );
}

export default function ThreatGlobe() {
  return (
    <Canvas camera={{ position: [0, 0.4, 4.2], fov: 42 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.75} />
      <pointLight position={[5, 3, 5]} intensity={1.1} color="#93c5fd" />
      <pointLight position={[-5, -2, -4]} intensity={0.4} color="#818cf8" />
      <Stars radius={80} depth={40} count={2200} factor={3} saturation={0} fade speed={0.4} />
      <Globe />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3}
        maxDistance={6}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
