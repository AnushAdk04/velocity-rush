'use client'

import * as THREE from 'three'
import { JSX, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  NEON_CITY_WAYPOINTS,
  NEON_CITY_CHECKPOINTS,
  NEON_FINISH_LINE,
} from './NeonCityCheckpoints'

const ROAD_WIDTH = 24

function getDirections(pts: THREE.Vector3[]): THREE.Vector3[] {
  return pts.map((_, i) => {
    const prev = pts[(i - 1 + pts.length) % pts.length]
    const next = pts[(i + 1) % pts.length]
    return new THREE.Vector3().subVectors(next, prev).normalize()
  })
}

function TrackSurface() {
  const geometry = useMemo(() => {
    const points = NEON_CITY_WAYPOINTS
    const dirs = getDirections(points)
    const vertices: number[] = []
    const indices: number[] = []
    const uvs: number[] = []
    let totalDist = 0

    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      const dir = dirs[i]
      const right = new THREE.Vector3(-dir.z, 0, dir.x)
      const lv = pt.clone().add(right.clone().multiplyScalar(-ROAD_WIDTH / 2))
      const rv = pt.clone().add(right.clone().multiplyScalar(ROAD_WIDTH / 2))
      if (i > 0) totalDist += points[i].distanceTo(points[i - 1])
      vertices.push(lv.x, 0.02, lv.z)
      vertices.push(rv.x, 0.02, rv.z)
      uvs.push(0, totalDist / 20)
      uvs.push(1, totalDist / 20)
    }

    for (let i = 0; i < points.length - 1; i++) {
      const a = i * 2, b = i * 2 + 1
      const c = (i + 1) * 2, d = (i + 1) * 2 + 1
      indices.push(a, b, c, b, d, c)
    }
    const last = (points.length - 1) * 2
    indices.push(last, last + 1, 0, last + 1, 1, 0)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#222222" roughness={0.95} />
    </mesh>
  )
}

function NeonMarkings() {
  const points = NEON_CITY_WAYPOINTS
  return (
    <>
      {points.map((pt, i) => {
        if (i % 2 !== 0 || i >= points.length - 1) return null
        const next = points[i + 1]
        const mid = pt.clone().lerp(next, 0.5)
        const dir = new THREE.Vector3().subVectors(next, pt)
        const len = dir.length() * 0.45
        const angle = Math.atan2(dir.x, dir.z)
        return (
          <mesh key={i} position={[mid.x, 0.03, mid.z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.35, 0.01, len]} />
            <meshStandardMaterial color="white" />
          </mesh>
        )
      })}
    </>
  )
}

function NeonBarriers() {
  const points = NEON_CITY_WAYPOINTS
  const elements: JSX.Element[] = []
  const totalSegs = points.length - 1

  for (let i = 2; i < totalSegs - 2; i++) {
    const cur = points[i]
    const nxt = points[i + 1]
    const segDir = new THREE.Vector3().subVectors(nxt, cur)
    const segLen = segDir.length()
    if (segLen < 1) continue
    const segAngle = Math.atan2(segDir.x, segDir.z)
    const dir = segDir.clone().normalize()
    const right = new THREE.Vector3(-dir.z, 0, dir.x)
    const segMid = cur.clone().lerp(nxt, 0.5)
    const half = ROAD_WIDTH / 2 + 0.4

    const neonColors = ['#bf5fff', '#00ffff', '#ff0088', '#ffd60a']
    const color = neonColors[i % neonColors.length]

    ;[-half, half].forEach((side, si) => {
      const edgeMid = segMid.clone().add(right.clone().multiplyScalar(side))

      elements.push(
        <mesh
          key={`base-${i}-${si}`}
          position={[edgeMid.x, 0.3, edgeMid.z]}
          rotation={[0, segAngle, 0]}
        >
          <boxGeometry args={[0.6, 0.6, segLen * 0.96]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.9} />
        </mesh>
      )

      elements.push(
        <mesh
          key={`neon-${i}-${si}`}
          position={[edgeMid.x, 0.68, edgeMid.z]}
          rotation={[0, segAngle, 0]}
        >
          <boxGeometry args={[0.14, 0.1, segLen * 0.94]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
        </mesh>
      )
    })
  }

  return <>{elements}</>
}

function CityBuildings() {
  const buildings = useMemo(() => [
    // Left cluster
    { x: -260, z: -100, w: 28, h: 75, d: 28, neon: '#bf5fff' },
    { x: -250, z:  -30, w: 22, h: 50, d: 22, neon: '#00ffff' },
    { x: -240, z:   50, w: 18, h: 35, d: 18, neon: '#ff0088' },
    { x: -170, z: -170, w: 24, h: 60, d: 24, neon: '#ffd60a' },
    { x:  -90, z: -185, w: 20, h: 80, d: 20, neon: '#bf5fff' },
    // Right cluster
    { x:  320, z:  -90, w: 26, h: 70, d: 26, neon: '#00ffff' },
    { x:  310, z:  -20, w: 20, h: 45, d: 20, neon: '#ff0088' },
    { x:  170, z: -185, w: 22, h: 65, d: 22, neon: '#ffd60a' },
    { x:  240, z: -185, w: 18, h: 55, d: 18, neon: '#bf5fff' },
    // Top area
    { x: -100, z:  160, w: 22, h: 50, d: 22, neon: '#00ffff' },
    { x:   60, z:  160, w: 26, h: 65, d: 26, neon: '#ff0088' },
    { x:  160, z:  160, w: 20, h: 45, d: 20, neon: '#ffd60a' },
  ], [])

  return (
    <>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color="#080812" roughness={0.9} />
          </mesh>
          <mesh position={[0, b.h + 0.25, 0]}>
            <boxGeometry args={[b.w + 0.5, 0.4, b.d + 0.5]} />
            <meshStandardMaterial color={b.neon} emissive={b.neon} emissiveIntensity={2} />
          </mesh>
          {/* Window rows */}
          {[0.25, 0.5, 0.72].map((yFrac, ri) =>
            [-0.3, 0.3].map((xFrac, ci) => (
              <mesh
                key={`${ri}-${ci}`}
                position={[xFrac * b.w, b.h * yFrac, b.d / 2 + 0.05]}
              >
                <boxGeometry args={[b.w * 0.22, b.h * 0.1, 0.05]} />
                <meshStandardMaterial
                  color={b.neon} emissive={b.neon}
                  emissiveIntensity={0.5} transparent opacity={0.7}
                />
              </mesh>
            ))
          )}
        </group>
      ))}
    </>
  )
}

function NeonLights() {
  const refs = [
    useRef<THREE.PointLight>(null!),
    useRef<THREE.PointLight>(null!),
    useRef<THREE.PointLight>(null!),
    useRef<THREE.PointLight>(null!),
  ]

  const config: { pos: [number,number,number]; color: string }[] = [
    { pos: [0,    6, -40],  color: '#bf5fff' },
    { pos: [-140, 6, -140], color: '#00ffff' },
    { pos: [240,  6, -140], color: '#ff0088' },
    { pos: [140,  6,  10],  color: '#ffd60a' },
  ]

  useFrame(({ clock }) => {
    refs.forEach((ref, i) => {
      if (ref.current) {
        ref.current.intensity = 4 + Math.sin(clock.elapsedTime * 2.5 + i * 1.5) * 0.5
      }
    })
  })

  return (
    <>
      {config.map((c, i) => (
        <pointLight key={i} ref={refs[i]} position={c.pos} color={c.color} intensity={4} distance={60} />
      ))}
    </>
  )
}

function FinishLine() {
  const [fx, fz] = [NEON_FINISH_LINE.pos.x, NEON_FINISH_LINE.pos.z]
  return (
    <group position={[fx, 0, fz]}>
      {Array.from({ length: 8 }).map((_, col) =>
        Array.from({ length: 2 }).map((_, row) => (
          <mesh
            key={`${col}-${row}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[
              -ROAD_WIDTH / 2 + col * (ROAD_WIDTH / 8) + ROAD_WIDTH / 16,
              0.03, row * 1.5 - 0.75,
            ]}
          >
            <planeGeometry args={[ROAD_WIDTH / 8, 1.5]} />
            <meshStandardMaterial color={(col + row) % 2 === 0 ? 'white' : '#111'} />
          </mesh>
        ))
      )}
      {[-ROAD_WIDTH / 2 - 0.5, ROAD_WIDTH / 2 + 0.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 7, 8]} />
          <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={1} />
        </mesh>
      ))}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[ROAD_WIDTH + 2, 0.4, 0.4]} />
        <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

function CheckpointGates() {
  const points = NEON_CITY_WAYPOINTS
  return (
    <>
      {NEON_CITY_CHECKPOINTS.map((cp, i) => {
        let closestIdx = 0
        let minDist = Infinity
        points.forEach((p, j) => {
          const d = new THREE.Vector3(p.x, 0, p.z)
            .distanceTo(new THREE.Vector3(cp.pos.x, 0, cp.pos.z))
          if (d < minDist) { minDist = d; closestIdx = j }
        })
        const prev = points[(closestIdx - 1 + points.length) % points.length]
        const next = points[(closestIdx + 1) % points.length]
        const trackDir = new THREE.Vector3().subVectors(next, prev).normalize()
        const gateAngle = Math.atan2(trackDir.x, trackDir.z)
        const hw = ROAD_WIDTH / 2 + 0.5

        return (
          <group key={i} position={[cp.pos.x, 0, cp.pos.z]} rotation={[0, gateAngle, 0]}>
            {[-hw, hw].map((x, j) => (
              <mesh key={j} position={[x, 2.5, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
              </mesh>
            ))}
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[ROAD_WIDTH + 1, 0.25, 0.25]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} transparent opacity={0.9} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function CityGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -0.05, -20]}>
      <planeGeometry args={[800, 800]} />
      <meshStandardMaterial color="#080810" roughness={1} />
    </mesh>
  )
}

function Stars() {
  const positions = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      x: (Math.sin(i * 137.5) * 0.5 + 0.5) * 800 - 400,
      y: (Math.cos(i * 97.3) * 0.5 + 0.5) * 100 + 50,
      z: (Math.sin(i * 53.1) * 0.5 + 0.5) * 800 - 400,
      s: 0.2 + (i % 4) * 0.15,
    }))
  , [])

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.s, 4, 4]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
        </mesh>
      ))}
    </>
  )
}

export default function NeonCity() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[50, 120, 50]} intensity={1.6} color="#fff4d6" />
      <NeonLights />
      <pointLight position={[40, 10, -20]} color="#bf5fff" intensity={2} distance={120} />
      <pointLight position={[-100, 8, -70]} color="#00ffff" intensity={1.5} distance={100} />
      <pointLight position={[200, 8, -70]} color="#ff0088" intensity={1.5} distance={100} />

      <color attach="background" args={['#87b9df']} />

      <CityGround />
      <TrackSurface />
      <NeonMarkings />
      <NeonBarriers />
      <CityBuildings />
      <FinishLine />
      <CheckpointGates />
    </>
  )
}