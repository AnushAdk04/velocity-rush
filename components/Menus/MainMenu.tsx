'use client'

import { useGameStore } from '../../store/useGameStore'

export default function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)

  const startRace = () => {
    // Reset all race state then go to countdown
    useGameStore.setState({
      currentLap: 1,
      raceTime: 0,
      bestLapTime: null,
      position: 1,
      speed: 0,
      currentGear: 0,
      countdownValue: 3,
      phase: 'countdown',
    })
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a00 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'monospace',
      zIndex: 200,
    }}>
      {/* Title */}
      <div style={{ marginBottom: '8px', fontSize: '14px', letterSpacing: '8px', color: '#ffd60a' }}>
        WELCOME TO
      </div>
      <div style={{
        fontSize: '80px',
        fontWeight: 'bold',
        letterSpacing: '4px',
        lineHeight: 1,
        background: 'linear-gradient(180deg, #ffffff 0%, #ffd60a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
      }}>
        VELOCITY
      </div>
      <div style={{
        fontSize: '80px',
        fontWeight: 'bold',
        letterSpacing: '12px',
        lineHeight: 1,
        background: 'linear-gradient(180deg, #ffd60a 0%, #ff4400 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '48px',
      }}>
        RUSH
      </div>

      {/* Track info */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px 40px',
        marginBottom: '40px',
        textAlign: 'center',
        lineHeight: 2,
      }}>
        <div style={{ color: '#ffd60a', fontSize: '11px', letterSpacing: '4px', marginBottom: '8px' }}>
          RACE INFO
        </div>
        <div style={{ fontSize: '14px', color: '#cccccc' }}>
          🏁 Track: <span style={{ color: 'white' }}>Desert Run</span>
        </div>
        <div style={{ fontSize: '14px', color: '#cccccc' }}>
          🔄 Laps: <span style={{ color: 'white' }}>3</span>
        </div>
        <div style={{ fontSize: '14px', color: '#cccccc' }}>
          🚗 Opponents: <span style={{ color: 'white' }}>5 AI Racers</span>
        </div>
      </div>

      {/* Controls reminder */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 32px',
        marginBottom: '48px',
        fontSize: '13px',
        color: '#888888',
      }}>
        {[
          ['W / ↑', 'Accelerate'],
          ['S / ↓', 'Brake / Reverse'],
          ['A / ← D / →', 'Steer'],
          ['SPACE', 'Handbrake'],
          ['R', 'Reset at checkpoint'],
          ['C', 'Switch camera'],
        ].map(([key, action]) => (
          <div key={key} style={{ display: 'flex', gap: '12px' }}>
            <span style={{
              color: '#ffd60a',
              background: 'rgba(255,214,10,0.1)',
              padding: '1px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
            }}>
              {key}
            </span>
            <span>{action}</span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={startRace}
        style={{
          background: 'linear-gradient(135deg, #ffd60a, #ff8800)',
          color: '#000',
          border: 'none',
          padding: '18px 72px',
          fontSize: '22px',
          fontWeight: 'bold',
          borderRadius: '50px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          letterSpacing: '4px',
          boxShadow: '0 0 40px rgba(255,214,10,0.4)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 0 60px rgba(255,214,10,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(255,214,10,0.4)'
        }}
      >
        START RACE
      </button>

      <div style={{ marginTop: '24px', fontSize: '11px', color: '#444', letterSpacing: '2px' }}>
        DESERT RUN — SINGLE PLAYER
      </div>
    </div>
  )
}