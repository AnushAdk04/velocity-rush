'use client'

import { useGameStore } from '../../store/useGameStore'

export default function LapCounter() {
  const currentLap = useGameStore((s) => s.currentLap)
  const totalLaps = useGameStore((s) => s.totalLaps)
  const position = useGameStore((s) => s.position)
  const totalRacers = useGameStore((s) => s.totalRacers)
  const raceTime = useGameStore((s) => s.raceTime)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0')
    return `${m}:${s}.${ms}`
  }

  const positionSuffix = (pos: number) => {
    if (pos === 1) return 'ST'
    if (pos === 2) return 'ND'
    if (pos === 3) return 'RD'
    return 'TH'
  }

  return (
    <>
      {/* Top left — position */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        color: 'white',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1 }}>
            {position}
          </span>
          <span style={{ fontSize: '24px', marginBottom: '10px', color: '#ffd60a' }}>
            {positionSuffix(position)}
          </span>
          <span style={{ fontSize: '18px', marginBottom: '8px', color: '#aaaaaa' }}>
            /{totalRacers}
          </span>
        </div>
      </div>

      {/* Top center — lap */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontFamily: 'monospace',
        textAlign: 'center',
        userSelect: 'none',
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 24px',
        borderRadius: '24px',
      }}>
        <div style={{ fontSize: '11px', color: '#aaaaaa', marginBottom: '2px' }}>
          LAP
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
          {currentLap}
          <span style={{ fontSize: '16px', color: '#aaaaaa' }}>
            /{totalLaps}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#ffd60a', marginTop: '2px' }}>
          {formatTime(raceTime)}
        </div>
      </div>
    </>
  )
}