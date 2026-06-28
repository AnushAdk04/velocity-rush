'use client'

import { useEffect } from 'react'
import * as THREE from 'three'
import Speedometer from './Speedometer'
import LapCounter from './LapCounter'
import MiniMap from './MiniMap'
import Countdown from './Countdown'
import { useGameStore } from '../../store/useGameStore'
import { useCountdown } from '../../game/race/useCountdown'

interface HUDProps {
  carRef: React.RefObject<THREE.Group>
}

export default function HUD({ carRef }: HUDProps) {
  const tickTime = useGameStore((s) => s.tickTime)
  const phase = useGameStore((s) => s.phase)

  // Start countdown when component mounts
  useCountdown()

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

  if (phase === 'menu' || phase === 'countdown') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Countdown />
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <LapCounter />
        <Speedometer />
        <MiniMap carRef={carRef} />
        <Countdown />
      </div>
    </div>
  )
}