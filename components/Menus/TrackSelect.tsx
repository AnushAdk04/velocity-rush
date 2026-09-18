'use client'

import { useState } from 'react'
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
  const shapes: Record<string, string> = {
    desert: 'M 20 80 L 20 30 Q 20 15 35 12 L 90 12 Q 105 12 108 25 L 108 55 Q 108 65 95 68 L 60 68 Q 50 68 48 78 L 48 88 Q 48 98 35 98 L 30 98 Q 20 98 20 88 Z',
    neon:   'M 15 85 L 15 50 Q 15 35 28 30 L 45 25 L 45 40 L 75 40 L 75 20 Q 75 10 88 10 L 105 10 L 105 50 Q 105 65 90 68 L 65 68 L 65 85 Q 65 98 50 98 L 30 98 Q 15 98 15 85 Z',
    mountain:'M 20 90 L 25 55 Q 28 40 42 35 L 65 28 Q 78 24 82 35 L 88 55 Q 92 68 80 72 L 60 75 L 58 90 Q 56 100 42 100 L 32 100 Q 20 100 20 90 Z',
  }

  return (
    <div style={{
      width: '100%', height: '90px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <svg viewBox="0 0 124 110" width="110" height="90">
        {/* Track outline */}
        <path
          d={shapes[track.id]}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Track surface */}
        <path
          d={shapes[track.id]}
          fill="none"
          stroke={selected ? track.accentColor : 'rgba(255,255,255,0.35)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={selected ? 'none' : '4 3'}
        />
        {/* Start line dot */}
        <circle cx="20" cy="85" r="3"
          fill={selected ? track.accentColor : 'rgba(255,255,255,0.4)'} />
      </svg>
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