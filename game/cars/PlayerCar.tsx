'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCarPhysics, CarAlert } from './useCarPhysics'
import { useGameStore } from '../../store/useGameStore'
import { DESERT_HAWK } from '../../types/index'
import ChaseCamera from '../cameras/ChaseCamera'
import { useRaceManager } from '../race/useRaceManager'
import { usePositionTracker } from '../race/usePositionTracker'
import { useEngineSound } from '../audio/useEngineSound'
import { useSFX } from '../audio/useSFX'

function CarMesh({ speed }: { speed: React.RefObject<number> }) {
  const wheelRefs = [
    useRef<THREE.Mesh>(null!),
    useRef<THREE.Mesh>(null!),
    useRef<THREE.Mesh>(null!),
    useRef<THREE.Mesh>(null!),
  ]

  useFrame((_, delta) => {
    const spd = speed.current ?? 0
    const spinRate = (spd / 0.35) * delta
    wheelRefs.forEach((ref) => {
      if (ref.current) ref.current.rotation.x -= spinRate
    })
  })

  const wheelPositions: [number, number, number][] = [
    [-0.95, 0, -1.3],
    [ 0.95, 0, -1.3],
    [-0.95, 0,  1.3],
    [ 0.95, 0,  1.3],
  ]

  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0.2]}>
        <boxGeometry args={[1.4, 0.45, 2]} />
        <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.82, -0.7]}>
        <boxGeometry args={[1.35, 0.38, 0.05]} />
        <meshStandardMaterial color="#90e0ef" transparent opacity={0.5} />
      </mesh>
      {wheelPositions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh ref={wheelRefs[i]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.26, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.35, -2.01]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={1} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 2.01]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  )
}

interface PlayerCarProps {
  carRef: React.RefObject<THREE.Group>
  onAlert?: (alert: CarAlert) => void
}

export default function PlayerCar({ carRef, onAlert }: PlayerCarProps) {
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setCurrentGear = useGameStore((s) => s.setCurrentGear)
  const engine = useEngineSound()
  const sfx = useSFX()
  const engineStarted = useRef(false)
  const shakeRef = useRef(0)

  const handleShake = useCallback((intensity: number) => {
    shakeRef.current = Math.max(shakeRef.current, intensity)
  }, [])

  const handleScreech = useCallback((intensity: number) => {
    sfx.updateScreech(intensity)
  }, [])

  const { speed, currentGear } = useCarPhysics(carRef, {
    topSpeed: DESERT_HAWK.topSpeed / 3.6,
    acceleration: 12,
    braking: 28,
    handling: 1.4,
    grip: 0.88,
    onAlert,
    onShake: handleShake,
    onScreech: handleScreech,
  })

  useRaceManager(carRef)
  usePositionTracker(carRef)

  useFrame(() => {
    const spd = Math.abs(speed.current) * 3.6
    const gear = currentGear.current + 1
    setSpeed(spd)
    setCurrentGear(gear)

    if (!engineStarted.current && spd > 0.5) {
      engine.start()
      engineStarted.current = true
    }
    if (engineStarted.current) {
      engine.update(spd, gear)
    }
  })

  useEffect(() => {
    return () => { if (engineStarted.current) engine.stop() }
  }, [])

  return (
    <>
      <group ref={carRef} position={[0, 0.4, 50]}>
        <CarMesh speed={speed} />
      </group>
      <ChaseCamera target={carRef} speed={speed} shakeRef={shakeRef} />
    </>
  )
}