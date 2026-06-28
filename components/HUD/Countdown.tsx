'use client'

import { useGameStore } from '../../store/useGameStore'

export default function Countdown() {
  const phase = useGameStore((s) => s.phase)
  const value = useGameStore((s) => s.countdownValue)

  if (phase !== 'countdown' && !(phase === 'racing' && value === 0)) return null

  const isGo = value === 0

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 60,
    }}>
      <div
        key={value}  // re-trigger animation on each number
        style={{
          fontSize: isGo ? '120px' : '160px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          color: isGo ? '#00ff88' : value === 1 ? '#ff4444' : '#ffd60a',
          textShadow: `0 0 40px ${isGo ? '#00ff88' : '#ffd60a'}`,
          animation: 'countPop 0.8s ease-out forwards',
          letterSpacing: isGo ? '8px' : '0',
        }}
      >
        {isGo ? 'GO!' : value}
      </div>
      <style>{`
        @keyframes countPop {
          0%   { transform: scale(1.8); opacity: 0; }
          20%  { transform: scale(1.0); opacity: 1; }
          70%  { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}