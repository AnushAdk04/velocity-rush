'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS } from '../tracks/checkpoints'
import { NEON_CITY_WAYPOINTS } from '../tracks/NeonCityCheckpoints'
import { MOUNTAIN_WAYPOINTS } from '../tracks/MountainCheckpoints'
import { registerAIPosition } from '../race/usePositionTracker'
import { useGameStore } from '../../store/useGameStore'

function getWaypoints() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') return NEON_CITY_WAYPOINTS
  if (track === 'mountain') return MOUNTAIN_WAYPOINTS
  return DESERT_RUN_WAYPOINTS
}

interface GhostCarProps {
  index: number
  startX?: number
  startZ?: number
  speed?: number
  color?: string
}

function GhostCarMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0.2]}>
        <boxGeometry args={[1.4, 0.45, 2]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {[[-0.95,0,-1.3],[0.95,0,-1.3],[-0.95,0,1.3],[0.95,0,1.3]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]} rotation={[0,0,Math.PI/2]}>
          <cylinderGeometry args={[0.35,0.35,0.25,12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      ))}
      {[-0.55,0.55].map((x,i) => (
        <mesh key={i} position={[x,0.35,2.01]}>
          <boxGeometry args={[0.3,0.15,0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

export default function GhostCar({
  index,
  startX = 0,
  startZ = 60,
  speed = 18,
  color = '#4361ee',
}: GhostCarProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const startPos = new THREE.Vector3(startX, 0.4, startZ)

  const closestStart = (() => {
    let minDist = Infinity
    let closest = 0
    getWaypoints().forEach((wp, i) => {
      const d = startPos.distanceTo(wp)
      if (d < minDist) { minDist = d; closest = i }
    })
    return closest
  })()

  const waypointIndex = useRef(closestStart)
  const currentPos = useRef(startPos.clone())
  const started = useRef(false)

  useFrame((_, delta) => {
    const car = groupRef.current
    if (!car) return
    const dt = Math.min(delta, 0.05)

    // Wait for race to start — read from store
    const { phase } = useGameStore.getState()
    if (phase !== 'racing') return
    if (!started.current) started.current = true

    const waypoints = getWaypoints()
    const target = waypoints[waypointIndex.current]
    const dir = new THREE.Vector3().subVectors(target, currentPos.current)
    const distance = dir.length()

    if (distance < 2.5) {
      waypointIndex.current = (waypointIndex.current + 1) % waypoints.length
      return
    }

    dir.normalize()
    currentPos.current.addScaledVector(dir, speed * dt)
    car.position.set(currentPos.current.x, 0.4, currentPos.current.z)
    car.rotation.y = Math.atan2(dir.x, dir.z)

    // Register position for race position calculation
    registerAIPosition(index, currentPos.current)
  })

  return (
    <group ref={groupRef} position={[startX, 0.4, startZ]}>
      <GhostCarMesh color={color} />
    </group>
  )
}