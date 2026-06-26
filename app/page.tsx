'use client'

import dynamic from 'next/dynamic'
import HUD from '../components/HUD/HUD'
import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

const GameScene = dynamic(() => import('../game/GameScene'), { ssr: false })

export default function Home() {
  const setPhase = useGameStore((s) => s.setPhase)

  // Auto-start race for now — menu comes later
  useEffect(() => {
    setPhase('racing')
  }, [setPhase])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameScene />
      <HUD />
    </div>
  )
}