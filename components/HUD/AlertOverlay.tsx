'use client'

import { useEffect, useRef, useState } from 'react'
import { CarAlert } from '../../game/cars/useCarPhysics'

interface AlertOverlayProps {
  alert: CarAlert
}

export default function AlertOverlay({ alert }: AlertOverlayProps) {
  const [display, setDisplay] = useState<CarAlert>('none')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (alert !== 'none') {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      setDisplay(alert)
    } else {
      // Delay hiding so it doesn't flicker off instantly
      hideTimer.current = setTimeout(() => setDisplay('none'), 1000)
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [alert])

  if (display === 'none') return null

  const isWrongWay = display === 'wrongway'

  return (
    <div style={{
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 50,
    }}>
      <div style={{
        background: isWrongWay
          ? 'rgba(200,0,0,0.88)'
          : 'rgba(180,80,0,0.88)',
        color: 'white',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '30px',
        padding: '14px 36px',
        borderRadius: '8px',
        letterSpacing: '3px',
        boxShadow: '0 0 40px rgba(0,0,0,0.6)',
        border: `2px solid ${isWrongWay ? '#ff4444' : '#ffaa00'}`,
      }}>
        {isWrongWay ? '⚠ WRONG WAY!' : '⚠ OFF TRACK!'}
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.85)',
        fontSize: '13px',
        marginTop: '10px',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.6)',
        padding: '5px 14px',
        borderRadius: '4px',
        display: 'inline-block',
      }}>
        Press <strong>R</strong> to reset at last checkpoint
      </div>
    </div>
  )
}