'use client'

import { useEffect } from 'react'
import * as THREE from 'three'
import Speedometer from './Speedometer'
import LapCounter from './LapCounter'
import MiniMap from './MiniMap'
import { useGameStore } from '../../store/useGameStore'

interface HUDProps {
  carRef: React.RefObject<THREE.Group>
}

export default function HUD({ carRef }: HUDProps) {
  const tickTime = useGameStore((s) => s.tickTime)
  const phase = useGameStore((s) => s.phase)

  useEffect(() => {
    if (phase !== 'racing') return
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      tickTime((now - last) / 1000)
      last = now
      id = requestAnimationFrame(tick)
    }
    let id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [phase, tickTime])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <LapCounter />
        <Speedometer />
        <MiniMap carRef={carRef} />
      </div>
    </div>
  )
}