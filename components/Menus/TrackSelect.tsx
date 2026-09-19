'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { TRACKS, TrackConfig } from '../../game/tracks/trackRegistry'

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i <= level ? '#ffffff' : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
      <span style={{ marginLeft: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
        {['', 'Easy', 'Medium', 'Hard'][level]}
      </span>
    </div>
  )
}

function TrackCard({
  track,
  selected,
  onClick,
}: {
  track: TrackConfig
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: `2px solid ${selected ? track.accentColor : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        padding: '24px',
        background: selected
          ? `linear-gradient(135deg, ${track.bgColor}, rgba(255,255,255,0.04))`
          : 'rgba(255,255,255,0.03)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent glow when selected */}
      {selected && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at top left, ${track.accentColor}18, transparent 60%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Track preview — procedural visual */}
      <TrackPreview track={track} selected={selected} />

      <div style={{ marginTop: '16px' }}>
        <div style={{
          fontSize: '10px', letterSpacing: '3px',
          color: selected ? track.accentColor : 'rgba(255,255,255,0.35)',
          marginBottom: '4px',
        }}>
          {track.subtitle.toUpperCase()}
        </div>
        <div style={{
          fontSize: '20px', fontWeight: 'bold',
          color: 'white', marginBottom: '8px',
        }}>
          {track.name}
        </div>
        <DifficultyDots level={track.difficulty} />
        <p style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.5)',
          marginTop: '10px', lineHeight: 1.6,
        }}>
          {track.description}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '16px', marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            ['LENGTH', track.stats.length],
            ['TURNS', String(track.stats.turns)],
            ['TOP SPEED', track.stats.topSpeed],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px' }}>
                {label}
              </div>
              <div style={{
                fontSize: '13px', fontWeight: 'bold',
                color: selected ? track.accentColor : 'white',
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Laps */}
        <div style={{
          marginTop: '12px', fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
        }}>
          {track.laps} LAPS
        </div>
      </div>
    </div>
  )
}

// Procedural track shape preview drawn as SVG lines
function TrackPreview({ track, selected }: { track: TrackConfig; selected: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Import waypoints per track
  const getWaypoints = () => {
    if (track.id === 'neon') {
      const { NEON_CITY_WAYPOINTS } = require('../../game/tracks/NeonCityCheckpoints')
      return NEON_CITY_WAYPOINTS as { x: number; z: number }[]
    }
    if (track.id === 'mountain') {
      const { MOUNTAIN_WAYPOINTS } = require('../../game/tracks/MountainCheckpoints')
      return MOUNTAIN_WAYPOINTS as { x: number; z: number }[]
    }
    const { DESERT_RUN_WAYPOINTS } = require('../../game/tracks/checkpoints')
    return DESERT_RUN_WAYPOINTS as { x: number; z: number }[]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 110, H = 90
    const pts = getWaypoints()
    const xs = pts.map(p => p.x)
    const zs = pts.map(p => p.z)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minZ = Math.min(...zs), maxZ = Math.max(...zs)
    const rangeX = maxX - minX || 1
    const rangeZ = maxZ - minZ || 1
    const pad = 10

    const toCanvas = (x: number, z: number): [number, number] => [
      ((x - minX) / rangeX) * (W - pad * 2) + pad,
      ((z - minZ) / rangeZ) * (H - pad * 2) + pad,
    ]

    ctx.clearRect(0, 0, W, H)

    // Outline
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => {
      const [cx, cz] = toCanvas(p.x, p.z)
      i === 0 ? ctx.moveTo(cx, cz) : ctx.lineTo(cx, cz)
    })
    ctx.closePath()
    ctx.stroke()

    // Surface
    ctx.strokeStyle = selected ? track.accentColor : 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    pts.forEach((p, i) => {
      const [cx, cz] = toCanvas(p.x, p.z)
      i === 0 ? ctx.moveTo(cx, cz) : ctx.lineTo(cx, cz)
    })
    ctx.closePath()
    ctx.stroke()

    // Start dot
    const [sx, sz] = toCanvas(pts[0].x, pts[0].z)
    ctx.fillStyle = selected ? track.accentColor : 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(sx, sz, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }, [selected, track.id])

  return (
    <div style={{
      width: '100%', height: '90px',
      background: 'rgba(0,0,0,0.35)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <canvas ref={canvasRef} width={110} height={90} />
    </div>
  )
}

export default function TrackSelect() {
  const setTrack = useGameStore((s) => s.setTrack)
  const setPhase = useGameStore((s) => s.setPhase)
  const setTotalLaps = useGameStore((s) => s.totalLaps)
  const [selected, setSelected] = useState<TrackConfig>(TRACKS[0])

  const handleBack = () => useGameStore.setState({ phase: 'menu' })

  const handleRace = () => {
    setTrack(selected.id)
    useGameStore.setState({
      currentTrack: selected.id,
      totalLaps: selected.laps,
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
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'monospace',
      zIndex: 200, padding: '32px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '6px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
          SELECT TRACK
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px' }}>
          CHOOSE YOUR CIRCUIT
        </div>
      </div>

      {/* Track cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 320px)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {TRACKS.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            selected={selected.id === track.id}
            onClick={() => setSelected(track)}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '13px 32px', fontSize: '14px',
            borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'monospace', letterSpacing: '2px',
          }}
        >
          ← BACK
        </button>
        <button
          onClick={handleRace}
          style={{
            background: `linear-gradient(135deg, ${selected.accentColor}, ${selected.accentColor}aa)`,
            color: '#000', border: 'none',
            padding: '14px 56px', fontSize: '16px',
            fontWeight: 'bold', borderRadius: '8px',
            cursor: 'pointer', fontFamily: 'monospace',
            letterSpacing: '3px',
            boxShadow: `0 0 30px ${selected.accentColor}44`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.04)'
            e.currentTarget.style.boxShadow = `0 0 50px ${selected.accentColor}66`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = `0 0 30px ${selected.accentColor}44`
          }}
        >
          RACE →
        </button>
      </div>
    </div>
  )
}