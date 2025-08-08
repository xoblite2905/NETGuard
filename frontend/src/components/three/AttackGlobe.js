// src/components/three/AttackGlobe.js
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Function to convert Lat/Lon to 3D coordinates
const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

// Represents one animated attack arc
const AttackArc = ({ start, end }) => {
  const lineRef = useRef();

  // Create a curve
  const curve = useMemo(() => {
    const startVec = latLonToVector3(start[0], start[1], 1.5);
    const endVec = latLonToVector3(end[0], end[1], 1.5);
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5).normalize().multiplyScalar(2.0);
    return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  }, [start, end]);

  // Animate the line's dash
  useFrame(() => {
    if(lineRef.current) {
        lineRef.current.material.dashOffset -= 0.005;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={curve.getPoints(50)}
      color="#F85149"
      lineWidth={1.5}
      dashed={true}
      dashSize={0.1}
      gapSize={0.1}
    />
  );
};

const Globe = () => {
  const meshRef = useRef();
  
  // Fake attack data (latitude, longitude)
  const attacks = [
      { start: [34.0522, -118.2437] }, // Los Angeles
      { start: [51.5074, -0.1278] }, // London
      { start: [35.6895, 139.6917] }, // Tokyo
      { start: [-33.8688, 151.2093] }, // Sydney
  ];
  // Our location (target)
  const target = [40.7128, -74.0060]; // New York

  useFrame((state, delta) => {
    // Subtle rotation
    meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={meshRef}>
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial color="#0D1117" roughness={0.7} metalness={0.2} />
        </Sphere>
        {attacks.map((attack, i) => (
            <AttackArc key={i} start={attack.start} end={target} />
        ))}
    </group>
  );
};

const AttackGlobe = () => {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, 5, -10]} intensity={0.5} color="#388BFD" />
            <Globe />
        </Canvas>
    )
}

export default AttackGlobe;