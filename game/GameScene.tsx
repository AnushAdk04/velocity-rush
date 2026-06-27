'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import DesertRun from './tracks/DesertRun'
import PlayerCar from './cars/PlayerCar'
import AIManager from './ai/AIManager'

export const CONTROLS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'brake', keys: ['Space'] },
  { name: 'camera', keys: ['KeyC'] },
]

interface GameSceneProps {
  carRef: React.RefObject<THREE.Group>
}

export default function GameScene({ carRef }: GameSceneProps) {
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
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 80, 50]} intensity={1.2} />
        <DesertRun />
        <PlayerCar carRef={carRef} />
        <AIManager />
      </Canvas>
    </KeyboardControls>
  )
}