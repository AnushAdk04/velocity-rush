'use client'

import dynamic from 'next/dynamic'
import HUD from '../components/HUD/HUD'
import AlertOverlay from '../components/HUD/AlertOverlay'
import MainMenu from '../components/Menus/MainMenu'
import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'
import { CarAlert } from '../game/cars/useCarPhysics'
import TrackSelect from '@/components/Menus/TrackSelect'

const GameScene = dynamic(() => import('../game/GameScene'), { ssr: false })

function FinishedScreen() {
  const raceTime = useGameStore((s) => s.raceTime)
  const bestLapTime = useGameStore((s) => s.bestLapTime)
  const position = useGameStore((s) => s.position)

  const fmt = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0')
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    const ms = Math.floor((t % 1) * 100).toString().padStart(2, '0')
    return `${m}:${s}.${ms}`
  }

  const posLabel = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH'][position - 1] ?? `${position}TH`
  const podium = position <= 3

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.82)',
      color: 'white', fontFamily: 'monospace', zIndex: 100,
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(10,10,20,0.95)',
        padding: '48px 72px',
        borderRadius: '24px',
        border: `1px solid ${podium ? '#ffd60a' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: podium ? '0 0 60px rgba(255,214,10,0.2)' : 'none',
      }}>
        <div style={{ fontSize: '14px', letterSpacing: '6px', color: '#888', marginBottom: '12px' }}>
          RACE COMPLETE
        </div>

        {/* Finishing position */}
        <div style={{
          fontSize: '96px',
          fontWeight: 'bold',
          color: podium ? '#ffd60a' : '#ffffff',
          lineHeight: 1,
          marginBottom: '4px',
        }}>
          {posLabel}
        </div>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
          FINISHING POSITION
        </div>

        {/* Stats */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px 32px',
          marginBottom: '32px',
          lineHeight: 2.2,
        }}>
          <div style={{ fontSize: '15px' }}>
            Total Time{' '}
            <span style={{ color: '#ffd60a', float: 'right', marginLeft: '32px' }}>
              {fmt(raceTime)}
            </span>
          </div>
          <div style={{ fontSize: '15px' }}>
            Best Lap{' '}
            <span style={{ color: '#00b4d8', float: 'right', marginLeft: '32px' }}>
              {bestLapTime !== null ? fmt(bestLapTime) : '--'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => useGameStore.setState({
              phase: 'trackselect',
              currentLap: 1,
              raceTime: 0,
              bestLapTime: null,
              position: 1,
              speed: 0,
              currentGear: 0,
              countdownValue: 3,
            })}
            style={{
              background: '#ffd60a', color: '#000',
              border: 'none', padding: '14px 36px',
              fontSize: '16px', fontWeight: 'bold',
              borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: '2px',
            }}
          >
            RACE AGAIN
          </button>
          <button
            onClick={() => useGameStore.setState({ phase: 'menu' })}
            style={{
              background: 'transparent', color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '14px 36px', fontSize: '16px',
              borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: '2px',
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const phase = useGameStore((s) => s.phase)
  const carRef = useRef<THREE.Group>(null!)
  const [alert, setAlert] = useState<CarAlert>('none')
  const handleAlert = useCallback((a: CarAlert) => setAlert(a), [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Game always renders in background */}
      <GameScene carRef={carRef} onAlert={handleAlert} />

      {phase === 'menu' && <MainMenu />}

      {(phase === 'countdown' || phase === 'racing') && (
        <>
          <HUD carRef={carRef} />
          <AlertOverlay alert={alert} />
        </>
      )}

      {phase === 'finished' && <FinishedScreen />}
      {phase === 'trackselect' && <TrackSelect />}
    </div>
  )
}