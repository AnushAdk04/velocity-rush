'use client'

import dynamic from 'next/dynamic'
import HUD from '../components/HUD/HUD'
import AlertOverlay from '../components/HUD/AlertOverlay'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'
import { CarAlert } from '../game/cars/useCarPhysics'

const GameScene = dynamic(() => import('../game/GameScene'), { ssr: false })

function FinishedScreen() {
  const raceTime = useGameStore((s) => s.raceTime)
  const bestLapTime = useGameStore((s) => s.bestLapTime)
  const fmt = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0')
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    const ms = Math.floor((t % 1) * 100).toString().padStart(2, '0')
    return `${m}:${s}.${ms}`
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)',
      color: 'white', fontFamily: 'monospace', zIndex: 100,
    }}>
      <div style={{
        textAlign: 'center', background: 'rgba(0,0,0,0.8)',
        padding: '48px 64px', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffd60a' }}>
          RACE COMPLETE
        </div>
        <div style={{ margin: '24px 0', fontSize: '18px', lineHeight: 2 }}>
          <div>Total Time: <span style={{ color: '#ffd60a' }}>{fmt(raceTime)}</span></div>
          <div>Best Lap: <span style={{ color: '#00b4d8' }}>
            {bestLapTime !== null ? fmt(bestLapTime) : '--'}
          </span></div>
        </div>
        <button
          onClick={() => useGameStore.setState({
            phase: 'racing', currentLap: 1,
            raceTime: 0, bestLapTime: null,
          })}
          style={{
            background: '#ffd60a', color: '#000', border: 'none',
            padding: '14px 40px', fontSize: '18px', fontWeight: 'bold',
            borderRadius: '8px', cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          RACE AGAIN
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const setPhase = useGameStore((s) => s.setPhase)
  const phase = useGameStore((s) => s.phase)
  const carRef = useRef<THREE.Group>(null!)
  const [alert, setAlert] = useState<CarAlert>('none')

  const handleAlert = useCallback((a: CarAlert) => setAlert(a), [])

  useEffect(() => { setPhase('racing') }, [setPhase])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameScene carRef={carRef} onAlert={handleAlert} />
      <HUD carRef={carRef} />
      <AlertOverlay alert={alert} />
      {phase === 'finished' && <FinishedScreen />}
    </div>
  )
}