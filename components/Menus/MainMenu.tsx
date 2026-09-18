'use client'

import { useGameStore } from '../../store/useGameStore'

export default function MainMenu() {
  const goToTrackSelect = () => {
    useGameStore.setState({ phase: 'trackselect' })
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #0a0a0f 0%, #0f0a00 50%, #0a0f0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'monospace',
      zIndex: 200, overflow: 'hidden',
    }}>

      {/* Background grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,214,10,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,214,10,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Corner accent lines */}
      {[
        { top: 24, left: 24, borderTop: '1px solid rgba(255,214,10,0.3)', borderLeft: '1px solid rgba(255,214,10,0.3)', width: 60, height: 60 },
        { top: 24, right: 24, borderTop: '1px solid rgba(255,214,10,0.3)', borderRight: '1px solid rgba(255,214,10,0.3)', width: 60, height: 60 },
        { bottom: 24, left: 24, borderBottom: '1px solid rgba(255,214,10,0.3)', borderLeft: '1px solid rgba(255,214,10,0.3)', width: 60, height: 60 },
        { bottom: 24, right: 24, borderBottom: '1px solid rgba(255,214,10,0.3)', borderRight: '1px solid rgba(255,214,10,0.3)', width: 60, height: 60 },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', ...style }} />
      ))}

      {/* Version tag */}
      <div style={{
        position: 'absolute', top: 32, left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px', letterSpacing: '4px',
        color: 'rgba(255,255,255,0.2)',
      }}>
        v1.0 — SINGLE PLAYER
      </div>

      {/* Main title block */}
      <div style={{ textAlign: 'center', position: 'relative', marginBottom: '48px' }}>
        {/* Glow behind title */}
        <div style={{
          position: 'absolute', inset: '-40px',
          background: 'radial-gradient(ellipse, rgba(255,214,10,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '11px', letterSpacing: '10px',
          color: 'rgba(255,214,10,0.6)', marginBottom: '12px',
        }}>
          WELCOME TO
        </div>

        <div style={{
          fontSize: '88px', fontWeight: 'bold',
          letterSpacing: '-2px', lineHeight: 0.9,
          background: 'linear-gradient(180deg, #ffffff 20%, #ffd60a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          VELOCITY
        </div>
        <div style={{
          fontSize: '88px', fontWeight: 'bold',
          letterSpacing: '16px', lineHeight: 0.9,
          background: 'linear-gradient(180deg, #ffd60a 0%, #ff6600 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
        }}>
          RUSH
        </div>

        {/* Subtitle line */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '12px',
          marginTop: '16px',
        }}>
          <div style={{ height: '1px', width: '60px', background: 'rgba(255,214,10,0.3)' }} />
          <div style={{ fontSize: '11px', letterSpacing: '5px', color: 'rgba(255,255,255,0.35)' }}>
            3 TRACKS · 5 OPPONENTS · FULL RACE
          </div>
          <div style={{ height: '1px', width: '60px', background: 'rgba(255,214,10,0.3)' }} />
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={goToTrackSelect}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #ffd60a 0%, #ff8800 100%)',
          color: '#000', border: 'none',
          padding: '18px 80px', fontSize: '18px',
          fontWeight: 'bold', borderRadius: '4px',
          cursor: 'pointer', fontFamily: 'monospace',
          letterSpacing: '5px',
          boxShadow: '0 0 40px rgba(255,214,10,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          transition: 'all 0.15s ease',
          marginBottom: '48px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.04) translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 0 70px rgba(255,214,10,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(255,214,10,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      >
        START RACING
      </button>

      {/* Controls grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px 32px',
        padding: '20px 32px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        marginBottom: '32px',
      }}>
        {[
          ['W / ↑', 'Accelerate'],
          ['S / ↓', 'Brake / Reverse'],
          ['A D / ← →', 'Steer'],
          ['SPACE', 'Handbrake'],
          ['R', 'Reset at checkpoint'],
          ['C', 'Switch camera'],
        ].map(([key, action]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{
              background: 'rgba(255,214,10,0.1)',
              border: '1px solid rgba(255,214,10,0.25)',
              color: '#ffd60a', padding: '2px 8px',
              borderRadius: '4px', fontSize: '10px',
              letterSpacing: '1px', whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {key}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {action}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 24,
        fontSize: '10px', color: 'rgba(255,255,255,0.15)',
        letterSpacing: '3px',
      }}>
        BUILT WITH REACT THREE FIBER · THREE.JS · NEXT.JS
      </div>
    </div>
  )
}