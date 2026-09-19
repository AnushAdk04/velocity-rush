'use client'

import * as THREE from 'three'
import { JSX, useMemo } from 'react'
import {
  MOUNTAIN_WAYPOINTS,
  MOUNTAIN_CHECKPOINTS,
  MOUNTAIN_FINISH_LINE,
} from './MountainCheckpoints'

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
    const points = MOUNTAIN_WAYPOINTS
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
      // Use actual Y from waypoint for elevation
      lv.y = pt.y
      rv.y = pt.y
      if (i > 0) totalDist += points[i].distanceTo(points[i - 1])
      vertices.push(lv.x, lv.y, lv.z)
      vertices.push(rv.x, rv.y, rv.z)
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

function CenterLine() {
  const points = MOUNTAIN_WAYPOINTS
  return (
    <>
      {points.map((pt, i) => {
        if (i >= points.length - 1 || i % 2 !== 0) return null
        const next = points[i + 1]
        const mid = pt.clone().lerp(next, 0.5)
        const dir = new THREE.Vector3().subVectors(next, pt)
        const len = dir.length() * 0.45
        const angle = Math.atan2(dir.x, dir.z)
        return (
          <mesh key={i} position={[mid.x, mid.y + 0.02, mid.z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.35, 0.01, len]} />
            <meshStandardMaterial color="white" />
          </mesh>
        )
      })}
    </>
  )
}

// Stone crash barriers
function MountainBarriers() {
  const points = MOUNTAIN_WAYPOINTS
  const dirs = useMemo(() => getDirections(points), [])
  const elements: JSX.Element[] = []

  for (let i = 1; i < points.length - 2; i++) {
    const cur = points[i]
    const nxt = points[i + 1]
    const dir = dirs[i]
    const right = new THREE.Vector3(-dir.z, 0, dir.x)
    const segDir = new THREE.Vector3().subVectors(nxt, cur)
    const segLen = segDir.length()
    const segAngle = Math.atan2(segDir.x, segDir.z)
    const segMid = cur.clone().lerp(nxt, 0.5)
    const segMidY = (cur.y + nxt.y) / 2
    const half = ROAD_WIDTH / 2 + 0.4

    ;[-half, half].forEach((side, si) => {
      const edgeMid = segMid.clone().add(right.clone().multiplyScalar(side))

      // Stone barrier
      elements.push(
        <mesh
          key={`barrier-${i}-${si}`}
          position={[edgeMid.x, segMidY + 0.4, edgeMid.z]}
          rotation={[0, segAngle, 0]}
        >
          <boxGeometry args={[0.5, 0.8, segLen * 0.97]} />
          <meshStandardMaterial color="#666677" roughness={1} />
        </mesh>
      )
      // Red/white top stripe
      elements.push(
        <mesh
          key={`stripe-${i}-${si}`}
          position={[edgeMid.x, segMidY + 0.85, edgeMid.z]}
          rotation={[0, segAngle, 0]}
        >
          <boxGeometry args={[0.5, 0.08, segLen * 0.97]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ff0000' : '#ffffff'}
          />
        </mesh>
      )
    })
  }

  return <>{elements}</>
}

// Pine trees — simple cone + cylinder
function PineTrees() {
  const trees = [
    [-40, 0, -50], [-50, 0, -100], [-45, 2, -130],
    [260, 0, -80], [255, 4, -110], [250, 6, -130],
    [-30, 0, 30], [-40, 0, 60], [-35, 1, 90],
    [260, 0, 30], [255, 2, 60], [20, 0, 120],
    [80, 2, 120], [140, 4, 120], [180, 6, 0],
    [240, 7, -50], [-45, 4, -80], [270, 0, 10],
  ]

  return (
    <>
      {trees.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
            <meshStandardMaterial color="#5c3d1a" roughness={1} />
          </mesh>
          {/* Canopy layers */}
          {[0, 1.5, 3].map((yOff, j) => (
            <mesh key={j} position={[0, 3 + yOff, 0]}>
              <coneGeometry args={[3 - j * 0.6, 2.5, 7]} />
              <meshStandardMaterial color={`hsl(130,${40 + j * 8}%,${22 + j * 4}%)`} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

// Rocky mountain terrain
function MountainTerrain() {
  const rocks = [
    [-60, 0, -90, 12], [-70, 0, -30, 10], [-65, 0, 40, 8],
    [260, 6, -100, 14], [265, 4, -40, 10], [255, 2, 50, 9],
    [100, 0, 130, 11], [20, 0, 130, 8], [170, 0, 130, 13],
    [-30, 0, -160, 15], [220, 0, -160, 12],
  ]

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, -0.1, -20]}>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color="#4a5040" roughness={1} />
      </mesh>

      {/* Rocky outcrops */}
      {rocks.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color={`hsl(220,${10 + i % 3 * 5}%,${30 + i % 4 * 5}%)`} roughness={1} />
        </mesh>
      ))}

      {/* Mountain peaks in background */}
      {[
        [-200, 0, -200, 80], [300, 0, -250, 100],
        [-150, 0, 200, 70], [350, 0, 100, 90],
        [100, 0, -300, 120],
      ].map(([x, y, z, s], i) => (
        <mesh key={`peak-${i}`} position={[x, y, z]}>
          <coneGeometry args={[s, s * 1.6, 7]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#5a6070' : '#8899aa'}
            roughness={1}
          />
        </mesh>
      ))}
    </>
  )
}

function FinishLine() {
  const [fx, fz] = [MOUNTAIN_FINISH_LINE.pos.x, MOUNTAIN_FINISH_LINE.pos.z]
  return (
    <group position={[fx, 0.5, fz]}>
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
            <meshStandardMaterial color={(col + row) % 2 === 0 ? 'white' : 'black'} />
          </mesh>
        ))
      )}
      {[-ROAD_WIDTH / 2 - 0.5, ROAD_WIDTH / 2 + 0.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 7, 8]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[ROAD_WIDTH + 2, 0.4, 0.4]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function CheckpointGates() {
  const points = MOUNTAIN_WAYPOINTS
  return (
    <>
      {MOUNTAIN_CHECKPOINTS.map((cp, i) => {
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
        const gateY = points[closestIdx].y
        const hw = ROAD_WIDTH / 2 + 0.5

        return (
          <group key={i} position={[cp.pos.x, gateY, cp.pos.z]} rotation={[0, gateAngle, 0]}>
            {[-hw, hw].map((x, j) => (
              <mesh key={j} position={[x, 2.5, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
                <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.6} />
              </mesh>
            ))}
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[ROAD_WIDTH + 1, 0.25, 0.25]} />
              <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1.2} transparent opacity={0.9} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export default function MountainCircuit() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[100, 140, 50]} intensity={1.5} color="#fff4d6" />
      <directionalLight position={[-50, 70, -100]} intensity={0.4} color="#d6e8ff" />

      {/* Cool blue-grey mountain sky */}
      <color attach="background" args={['#8fb9d8']} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#8fb9d8', 160, 600]} />

      <MountainTerrain />
      <PineTrees />
      <TrackSurface />
      <CenterLine />
      <MountainBarriers />
      <FinishLine />
      <CheckpointGates />
    </>
  )
}