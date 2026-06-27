'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS, DESERT_RUN_CHECKPOINTS } from '../../game/tracks/checkpoints'

interface MiniMapProps {
  carRef: React.RefObject<THREE.Group>
}

const allX = DESERT_RUN_WAYPOINTS.map(p => p.x)
const allZ = DESERT_RUN_WAYPOINTS.map(p => p.z)
const minX = Math.min(...allX)
const maxX = Math.max(...allX)
const minZ = Math.min(...allZ)
const maxZ = Math.max(...allZ)
const trackW = maxX - minX
const trackH = maxZ - minZ

const MAP_SIZE = 180
const PADDING = 16

function worldToMap(x: number, z: number): [number, number] {
  const mx = ((x - minX) / trackW) * (MAP_SIZE - PADDING * 2) + PADDING
  const mz = ((z - minZ) / trackH) * (MAP_SIZE - PADDING * 2) + PADDING
  return [mx, mz]
}

function drawStaticTrack(ctx: CanvasRenderingContext2D) {
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
  DESERT_RUN_WAYPOINTS.forEach((p, i) => {
    const [mx, mz] = worldToMap(p.x, p.z)
    i === 0 ? ctx.moveTo(mx, mz) : ctx.lineTo(mx, mz)
  })
  ctx.closePath()
  ctx.stroke()

  // Track surface
  ctx.strokeStyle = '#aaaaaa'
  ctx.lineWidth = 5
  ctx.beginPath()
  DESERT_RUN_WAYPOINTS.forEach((p, i) => {
    const [mx, mz] = worldToMap(p.x, p.z)
    i === 0 ? ctx.moveTo(mx, mz) : ctx.lineTo(mx, mz)
  })
  ctx.closePath()
  ctx.stroke()

  // Finish line
  const [fx, fz] = worldToMap(0, 10)
  ctx.strokeStyle = '#ffd60a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(fx - 6, fz)
  ctx.lineTo(fx + 6, fz)
  ctx.stroke()

  // Checkpoints
  DESERT_RUN_CHECKPOINTS.forEach((cp) => {
    const [cx, cz] = worldToMap(cp.pos.x, cp.pos.z)
    ctx.fillStyle = '#00b4d8'
    ctx.beginPath()
    ctx.arc(cx, cz, 2.5, 0, Math.PI * 2)
    ctx.fill()
  })
}

export default function MiniMap({ carRef }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      drawStaticTrack(ctx)

      const car = carRef.current
      if (car) {
        const [cx, cz] = worldToMap(car.position.x, car.position.z)

        // Direction arrow
        const forward = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(car.quaternion)
        const dx = (forward.x / trackW) * (MAP_SIZE - PADDING * 2) * 0.2
        const dz = (forward.z / trackH) * (MAP_SIZE - PADDING * 2) * 0.2

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
  }, [carRef])

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
        DESERT RUN
      </div>
    </div>
  )
}