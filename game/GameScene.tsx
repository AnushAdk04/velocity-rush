'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import TrackLoader from './tracks/TrackLoader'
import PlayerCar from './cars/PlayerCar'
import AIManager from './ai/AIManager'
import { CarAlert } from './cars/useCarPhysics'
import AudioManager from './audio/AudioManager'
import { useGameStore } from '../store/useGameStore'

export const CONTROLS = [
  { name: 'forward',  keys: ['ArrowUp',    'KeyW'] },
  { name: 'backward', keys: ['ArrowDown',  'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft',  'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'brake',    keys: ['Space'] },
  { name: 'camera',   keys: ['KeyC'] },
  { name: 'reset',    keys: ['KeyR'] },
]

interface GameSceneProps {
  carRef: React.RefObject<THREE.Group>
  onAlert: (alert: CarAlert) => void
}

// Default lights only for non-night tracks
function DefaultLights() {
  const track = useGameStore((s) => s.currentTrack)
  if (track === 'neon') return null
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[50, 80, 50]} intensity={1.2} />
    </>
  )
}

export default function GameScene({ carRef, onAlert }: GameSceneProps) {
  return (
    <KeyboardControls map={CONTROLS}>
      <Canvas
        shadows={false}
        camera={{ fov: 60, position: [0, 8, 25] }}
        style={{ width: '100vw', height: '100vh' }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
          stencil: false,
        }}
      >
        <color attach="background" args={['#87CEEB']} />
        <DefaultLights />
        <TrackLoader />
        <PlayerCar carRef={carRef} onAlert={onAlert} />
        <AIManager />
        <AudioManager />
      </Canvas>
    </KeyboardControls>
  )
}