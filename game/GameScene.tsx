'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls } from '@react-three/drei'
import DesertRun from './tracks/DesertRun'
import PlayerCar from './cars/PlayerCar'

export const CONTROLS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'brake', keys: ['Space'] },
  { name: 'camera', keys: ['KeyC'] },
]

export default function GameScene() {
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
        <PlayerCar />

        {/* Temporary — remove once chase camera is in */}
        <OrbitControls />
      </Canvas>
    </KeyboardControls>
  )
}