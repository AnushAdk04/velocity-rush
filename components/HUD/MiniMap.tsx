'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS, DESERT_RUN_CHECKPOINTS } from '../../game/tracks/checkpoints'
import { NEON_CITY_WAYPOINTS, NEON_CITY_CHECKPOINTS, NEON_FINISH_LINE } from '../../game/tracks/NeonCityCheckpoints'
import { MOUNTAIN_WAYPOINTS, MOUNTAIN_CHECKPOINTS, MOUNTAIN_FINISH_LINE } from '../../game/tracks/MountainCheckpoints'
import { useGameStore } from '../../store/useGameStore'

interface MiniMapProps {
  carRef: React.RefObject<THREE.Group>
}

const MAP_SIZE = 180
const PADDING = 16

function worldToMap(
  x: number,
  z: number,
  minX: number,
  minZ: number,
  trackW: number,
  trackH: number,
): [number, number] {
  const mx = ((x - minX) / trackW) * (MAP_SIZE - PADDING * 2) + PADDING
  const mz = ((z - minZ) / trackH) * (MAP_SIZE - PADDING * 2) + PADDING
  return [mx, mz]
}

function drawStaticTrack(
  ctx: CanvasRenderingContext2D,
  waypoints: THREE.Vector3[],
  checkpoints: { pos: THREE.Vector3; radius: number }[],
  finishLine: THREE.Vector3,
  bounds: { minX: number; minZ: number; trackW: number; trackH: number },
) {
  ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE)

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.75)'
  ctx.beginPath()
  ctx.roundRect(0, 0, MAP_SIZE, MAP_SIZE, 12)
  ctx.fill()

  // Track outline
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  waypoints.forEach((p, i) => {
    const [mx, mz] = worldToMap(p.x, p.z, bounds.minX, bounds.minZ, bounds.trackW, bounds.trackH)
    i === 0 ? ctx.moveTo(mx, mz) : ctx.lineTo(mx, mz)
  })
  ctx.closePath()
  ctx.stroke()

  // Track surface
  ctx.strokeStyle = '#aaaaaa'
  ctx.lineWidth = 5
  ctx.beginPath()
  waypoints.forEach((p, i) => {
    const [mx, mz] = worldToMap(p.x, p.z, bounds.minX, bounds.minZ, bounds.trackW, bounds.trackH)
    i === 0 ? ctx.moveTo(mx, mz) : ctx.lineTo(mx, mz)
  })
  ctx.closePath()
  ctx.stroke()

  // Finish line
  const [fx, fz] = worldToMap(finishLine.x, finishLine.z, bounds.minX, bounds.minZ, bounds.trackW, bounds.trackH)
  ctx.strokeStyle = '#ffd60a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(fx - 6, fz)
  ctx.lineTo(fx + 6, fz)
  ctx.stroke()

  // Checkpoints
  checkpoints.forEach((cp) => {
    const [cx, cz] = worldToMap(cp.pos.x, cp.pos.z, bounds.minX, bounds.minZ, bounds.trackW, bounds.trackH)
    ctx.fillStyle = '#00b4d8'
    ctx.beginPath()
    ctx.arc(cx, cz, 2.5, 0, Math.PI * 2)
    ctx.fill()
  })
}

export default function MiniMap({ carRef }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const currentTrack = useGameStore((s) => s.currentTrack)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const trackData = currentTrack === 'neon'
      ? { waypoints: NEON_CITY_WAYPOINTS, checkpoints: NEON_CITY_CHECKPOINTS, finishLine: NEON_FINISH_LINE.pos, label: 'NEON CITY' }
      : currentTrack === 'mountain'
        ? { waypoints: MOUNTAIN_WAYPOINTS, checkpoints: MOUNTAIN_CHECKPOINTS, finishLine: MOUNTAIN_FINISH_LINE.pos, label: 'MOUNTAIN CIRCUIT' }
        : { waypoints: DESERT_RUN_WAYPOINTS, checkpoints: DESERT_RUN_CHECKPOINTS, finishLine: new THREE.Vector3(0, 0, 10), label: 'DESERT RUN' }
    const allX = trackData.waypoints.map((p) => p.x)
    const allZ = trackData.waypoints.map((p) => p.z)
    const bounds = {
      minX: Math.min(...allX),
      minZ: Math.min(...allZ),
      trackW: Math.max(Math.max(...allX) - Math.min(...allX), 1),
      trackH: Math.max(Math.max(...allZ) - Math.min(...allZ), 1),
    }

    const animate = () => {
      drawStaticTrack(ctx, trackData.waypoints, trackData.checkpoints, trackData.finishLine, bounds)

      const car = carRef.current
      if (car) {
        const [cx, cz] = worldToMap(car.position.x, car.position.z, bounds.minX, bounds.minZ, bounds.trackW, bounds.trackH)

        // Direction arrow
        const forward = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(car.quaternion)
        const dx = (forward.x / bounds.trackW) * (MAP_SIZE - PADDING * 2) * 0.2
        const dz = (forward.z / bounds.trackH) * (MAP_SIZE - PADDING * 2) * 0.2

        // Glow
        ctx.shadowColor = '#e63946'
        ctx.shadowBlur = 8
        ctx.fillStyle = '#e63946'
        ctx.beginPath()
        ctx.arc(cx, cz, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Arrow
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(cx, cz)
        ctx.lineTo(cx + dx, cz + dz)
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [carRef, currentTrack])

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '30px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{ display: 'block' }}
      />
      <div style={{
        position: 'absolute',
        bottom: '6px',
        right: '8px',
        fontSize: '9px',
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        userSelect: 'none',
      }}>
        {currentTrack === 'neon' ? 'NEON CITY' : currentTrack === 'mountain' ? 'MOUNTAIN CIRCUIT' : 'DESERT RUN'}
      </div>
    </div>
  )
}