'use client'

import { useState } from 'react'

export default function ControlsHint() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '30px',
      background: 'rgba(0,0,0,0.55)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      userSelect: 'none',
      lineHeight: '1.8',
    }}>
      <div style={{ color: '#ffd60a', marginBottom: '6px', fontSize: '11px' }}>
        CONTROLS
      </div>
      <div>W / ↑ &nbsp; Accelerate</div>
      <div>S / ↓ &nbsp; Reverse</div>
      <div>A / ← &nbsp; Steer left</div>
      <div>D / → &nbsp; Steer right</div>
      <div>SPACE &nbsp; Brake</div>
      <div
        onClick={() => setVisible(false)}
        style={{
          marginTop: '8px',
          color: '#aaaaaa',
          cursor: 'pointer',
          fontSize: '10px',
        }}
      >
        [click to hide]
      </div>
    </div>
  )
}