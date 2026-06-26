'use client'

import { useGameStore } from '../../store/useGameStore'

export default function Speedometer() {
  const speed = useGameStore((s) => s.speed)
  const rpm = Math.min((speed / 220) * 8000, 8000)

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      right: '30px',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '16px',
      padding: '16px 24px',
      color: 'white',
      fontFamily: 'monospace',
      userSelect: 'none',
      minWidth: '140px',
    }}>
      {/* Speed number */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        lineHeight: 1,
        color: speed > 180 ? '#ff4444' : speed > 100 ? '#ffd60a' : '#ffffff',
        textAlign: 'right',
      }}>
        {Math.round(speed)}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#aaaaaa',
        textAlign: 'right',
        marginBottom: '12px',
      }}>
        KM/H
      </div>

      {/* RPM bar */}
      <div style={{ marginBottom: '4px', fontSize: '10px', color: '#aaaaaa' }}>
        RPM
      </div>
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${(rpm / 8000) * 100}%`,
          background: rpm > 7000
            ? '#ff4444'
            : rpm > 5000
            ? '#ffd60a'
            : '#00b4d8',
          borderRadius: '3px',
          transition: 'width 0.05s',
        }} />
      </div>
      <div style={{
        fontSize: '10px',
        color: '#aaaaaa',
        textAlign: 'right',
        marginTop: '2px',
      }}>
        {Math.round(rpm)}
      </div>
    </div>
  )
}