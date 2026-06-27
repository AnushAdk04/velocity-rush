'use client'

import { useGameStore } from '../../store/useGameStore'

const GEAR_LABELS = ['1', '2', '3', '4', '5', '6']

export default function Speedometer() {
  const speed = useGameStore((s) => s.speed)
  const gear = useGameStore((s) => s.currentGear)
  const rpm = Math.min(((speed % 37) / 37) * 8000 + 800, 8500)

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      right: '30px',
      background: 'rgba(0,0,0,0.65)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      padding: '16px 24px',
      color: 'white',
      fontFamily: 'monospace',
      userSelect: 'none',
      minWidth: '160px',
    }}>
      {/* Gear indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '11px', color: '#aaaaaa' }}>GEAR</span>
        <span style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#ffd60a',
          lineHeight: 1,
        }}>
          {gear}
        </span>
      </div>

      {/* Gear dots */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '12px',
        justifyContent: 'flex-end',
      }}>
        {GEAR_LABELS.map((_, i) => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i < gear ? '#ffd60a' : 'rgba(255,255,255,0.15)',
            transition: 'background 0.1s',
          }} />
        ))}
      </div>

      {/* Speed */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        lineHeight: 1,
        color: speed > 160 ? '#ff4444' : speed > 100 ? '#ffd60a' : '#ffffff',
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
          width: `${(rpm / 8500) * 100}%`,
          background: rpm > 7500 ? '#ff4444' : rpm > 5500 ? '#ffd60a' : '#00b4d8',
          borderRadius: '3px',
          transition: 'width 0.04s',
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