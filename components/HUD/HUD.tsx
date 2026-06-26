'use client'

import { useEffect } from 'react'
import Speedometer from './Speedometer'
import LapCounter from './LapCounter'
import ControlsHint from './ControlsHint'
import { useGameStore } from '../../store/useGameStore'

export default function HUD() {
  const tickTime = useGameStore((s) => s.tickTime)
  const phase = useGameStore((s) => s.phase)

  // Race timer — runs in DOM, not in canvas
  useEffect(() => {
    if (phase !== 'racing') return
    let last = performance.now()

    const tick = () => {
      const now = performance.now()
      const delta = (now - last) / 1000
      last = now
      tickTime(delta)
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
        <ControlsHint />
      </div>
    </div>
  )
}