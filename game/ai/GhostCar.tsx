'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS } from '../tracks/checkpoints'

interface GhostCarProps {
  startWaypoint?: number   // offset so cars don't all start at same point
  speed?: number           // m/s
  color?: string
}

function GhostCarMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.8, 0.2]}>
        <boxGeometry args={[1.4, 0.45, 2]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
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
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      ))}
      {/* Taillights */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 2.01]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

export default function GhostCar({
  startWaypoint = 0,
  speed = 18,
  color = '#4361ee',
}: GhostCarProps) {
  const groupRef = useRef<THREE.Group>(null!)

  // Current waypoint index — stored in ref so no re-renders
  const waypointIndex = useRef(startWaypoint % DESERT_RUN_WAYPOINTS.length)

  // Smooth position for interpolation
  const currentPos = useRef(
    DESERT_RUN_WAYPOINTS[startWaypoint % DESERT_RUN_WAYPOINTS.length].clone()
  )

  useFrame((_, delta) => {
    const car = groupRef.current
    if (!car) return

    const dt = Math.min(delta, 0.05)
    const waypoints = DESERT_RUN_WAYPOINTS
    const target = waypoints[waypointIndex.current]

    // Direction to next waypoint
    const dir = new THREE.Vector3()
      .subVectors(target, currentPos.current)

    const distance = dir.length()

    // Reached this waypoint — advance to next
    if (distance < 2.5) {
      waypointIndex.current =
        (waypointIndex.current + 1) % waypoints.length
      return
    }

    // Move toward waypoint
    dir.normalize()
    currentPos.current.addScaledVector(dir, speed * dt)

    // Apply position
    car.position.set(
      currentPos.current.x,
      0.4,   // fixed ground height
      currentPos.current.z
    )

    // Face direction of travel
    const angle = Math.atan2(dir.x, dir.z)
    car.rotation.y = angle
  })

  return (
    <group ref={groupRef}>
      <GhostCarMesh color={color} />
    </group>
  )
}