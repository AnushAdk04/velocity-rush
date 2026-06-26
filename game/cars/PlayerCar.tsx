'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCarPhysics } from './useCarPhysics'
import { useGameStore } from '../../store/useGameStore'
import { DESERT_HAWK } from '../../types/index'
import ChaseCamera from '../cameras/ChaseCamera'

function CarMesh() {
  return (
    <group>
      {/* Car body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.8, 0.2]}>
        <boxGeometry args={[1.4, 0.45, 2]} />
        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Windscreen */}
      <mesh position={[0, 0.82, -0.7]}>
        <boxGeometry args={[1.35, 0.38, 0.05]} />
        <meshStandardMaterial color="#90e0ef" transparent opacity={0.5} />
      </mesh>

      {/* Wheels */}
      {[
        [-0.95, 0, -1.3],
        [0.95, 0, -1.3],
        [-0.95, 0, 1.3],
        [0.95, 0, 1.3],
      ].map(([x, y, z], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      ))}

      {/* Headlights */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.35, -2.01]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  )
}

export default function PlayerCar() {
  const carRef = useRef<THREE.Group>(null!)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const { speed } = useCarPhysics(carRef, {
    topSpeed: DESERT_HAWK.topSpeed / 3.6,
    acceleration: 22,
    braking: 30,
    handling: 2.0,
    grip: 0.88,
  })

  useFrame(() => {
    setSpeed(Math.abs(speed.current) * 3.6)
  })

  return (
    <>
      <group ref={carRef} position={[0, 0.4, 20]}>
        <CarMesh />
      </group>

      {/* Camera follows this car */}
      <ChaseCamera target={carRef} speed={speed} />
    </>
  )
}