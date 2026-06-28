'use client'

import * as THREE from 'three'
import { JSX, useMemo } from 'react'
import {
  DESERT_RUN_WAYPOINTS,
  DESERT_RUN_CHECKPOINTS,
  FINISH_LINE,
} from './checkpoints'

const ROAD_WIDTH = 24

// Get smoothed direction at each waypoint
function getDirections(): THREE.Vector3[] {
  const pts = DESERT_RUN_WAYPOINTS
  const dirs: THREE.Vector3[] = []
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[(i - 1 + pts.length) % pts.length]
    const next = pts[(i + 1) % pts.length]
    dirs.push(new THREE.Vector3().subVectors(next, prev).normalize())
  }
  return dirs
}

function TrackSurface() {
  const geometry = useMemo(() => {
    const points = DESERT_RUN_WAYPOINTS
    const dirs = getDirections()
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
    // Close the loop
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
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#222222" roughness={0.95} />
    </mesh>
  )
}

// White dashes along center line
function CenterLine() {
  const points = DESERT_RUN_WAYPOINTS
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

// Guard rails built along road edges using smoothed directions
function GuardRails() {
  const points = DESERT_RUN_WAYPOINTS
  const dirs = useMemo(() => getDirections(), [])
  const rails: JSX.Element[] = []
  const totalSegs = points.length - 1

  for (let i = 0; i < totalSegs; i++) {
    // Skip the last 2 segments (near finish line) and first segment
    // to avoid geometry fighting with the finish gantry
    if (i <= 2 || i >= totalSegs - 3) continue

    const cur = points[i]
    const nxt = points[i + 1]
    const dirCur = dirs[i]
    const rightCur = new THREE.Vector3(-dirCur.z, 0, dirCur.x)

    const segDir = new THREE.Vector3().subVectors(nxt, cur)
    const segLen = segDir.length()
    if (segLen < 1) continue  // skip degenerate segments

    const segAngle = Math.atan2(segDir.x, segDir.z)
    const segMid = cur.clone().lerp(nxt, 0.5)
    const half = ROAD_WIDTH / 2 + 0.3
    const useRail = i % 6 < 3

    const leftMid = segMid.clone().add(rightCur.clone().multiplyScalar(-half))
    const rightMid = segMid.clone().add(rightCur.clone().multiplyScalar(half))

    if (useRail) {
      ;[leftMid, rightMid].forEach((edgeMid, side) => {
        // Beam — 96% of segment length to avoid overlap at corners
        rails.push(
          <mesh
            key={`beam-${i}-${side}`}
            position={[edgeMid.x, 0.55, edgeMid.z]}
            rotation={[0, segAngle, 0]}
          >
            <boxGeometry args={[0.18, 0.4, segLen * 0.96]} />
            <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
          </mesh>
        )
        // Posts
        const numPosts = Math.max(Math.ceil(segLen / 8), 1)
        for (let p = 0; p <= numPosts; p++) {
          const t = p / numPosts
          const nextDir = dirs[Math.min(i + 1, dirs.length - 1)]
          const nextRight = new THREE.Vector3(-nextDir.z, 0, nextDir.x)
          const curEdge = cur.clone().add(rightCur.clone().multiplyScalar(side === 0 ? -half : half))
          const nxtEdge = nxt.clone().add(nextRight.clone().multiplyScalar(side === 0 ? -half : half))
          const postPos = curEdge.clone().lerp(nxtEdge, t)
          rails.push(
            <mesh
              key={`post-${i}-${side}-${p}`}
              position={[postPos.x, 0.35, postPos.z]}
            >
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          )
        }
      })
    } else {
      ;[0, 1].forEach((side) => {
        const edgeMid = side === 0 ? leftMid : rightMid
        const curKerbEdge = cur.clone().add(
          rightCur.clone().multiplyScalar(side === 0 ? -(half - 1) : (half - 1))
        )
        const nxtKerbEdge = nxt.clone().add(
          rightCur.clone().multiplyScalar(side === 0 ? -(half - 1) : (half - 1))
        )
        const numKerbs = Math.max(Math.ceil(segLen / 2.5), 1)
        for (let k = 0; k < numKerbs; k++) {
          const t = (k + 0.5) / numKerbs
          const kPos = curKerbEdge.clone().lerp(nxtKerbEdge, t)
          rails.push(
            <mesh
              key={`kerb-${i}-${side}-${k}`}
              position={[kPos.x, 0.03, kPos.z]}
              rotation={[0, segAngle, 0]}
            >
              <boxGeometry args={[1.6, 0.06, 2.0]} />
              <meshStandardMaterial
                color={k % 2 === 0
                  ? (side === 0 ? '#ff0000' : '#ffffff')
                  : (side === 0 ? '#ffffff' : '#ff0000')}
              />
            </mesh>
          )
        }
        // Sand strip
        const sandOffset = side === 0 ? -(half + 4) : (half + 4)
        const sandPos = edgeMid.clone().add(
          rightCur.clone().multiplyScalar(side === 0 ? -4 : 4)
        )
        rails.push(
          <mesh
            key={`sand-${i}-${side}`}
            position={[sandPos.x, 0.005, sandPos.z]}
            rotation={[0, segAngle, 0]}
          >
            <boxGeometry args={[6, 0.01, segLen * 0.96]} />
            <meshStandardMaterial color="#e9c46a" roughness={1} />
          </mesh>
        )
      })
    }
  }

  return <>{rails}</>
}

function FinishLine() {
  const [fx, fz] = [FINISH_LINE.pos.x, FINISH_LINE.pos.z]
  return (
    <group position={[fx, 0, fz]}>
      {/* Checkered pattern */}
      {Array.from({ length: 8 }).map((_, col) =>
        Array.from({ length: 2 }).map((_, row) => (
          <mesh
            key={`${col}-${row}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[
              -ROAD_WIDTH / 2 + col * (ROAD_WIDTH / 8) + ROAD_WIDTH / 16,
              0.03,
              row * 1.5 - 0.75,
            ]}
          >
            <planeGeometry args={[ROAD_WIDTH / 8, 1.5]} />
            <meshStandardMaterial
              color={(col + row) % 2 === 0 ? 'white' : 'black'}
            />
          </mesh>
        ))
      )}
      {/* Gantry posts */}
      {[-ROAD_WIDTH / 2 - 0.5, ROAD_WIDTH / 2 + 0.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 7, 8]} />
          <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Gantry beam */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[ROAD_WIDTH + 2, 0.4, 0.4]} />
        <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function CheckpointGates() {
  const points = DESERT_RUN_WAYPOINTS

  return (
    <>
      {DESERT_RUN_CHECKPOINTS.map((cp, i) => {
        // Find closest waypoint to this checkpoint
        let closestIdx = 0
        let minDist = Infinity
        points.forEach((p, j) => {
          const d = new THREE.Vector3(p.x, 0, p.z)
            .distanceTo(new THREE.Vector3(cp.pos.x, 0, cp.pos.z))
          if (d < minDist) { minDist = d; closestIdx = j }
        })

        // Get track direction at this point
        const prev = points[(closestIdx - 1 + points.length) % points.length]
        const next = points[(closestIdx + 1) % points.length]
        const trackDir = new THREE.Vector3().subVectors(next, prev).normalize()
        // Gate faces perpendicular to track direction
        const gateAngle = Math.atan2(trackDir.x, trackDir.z)

        const color = '#00b4d8'
        const hw = ROAD_WIDTH / 2 + 0.5

        return (
          <group
            key={i}
            position={[cp.pos.x, 0, cp.pos.z]}
            rotation={[0, gateAngle, 0]}
          >
            {/* Left post */}
            <mesh position={[-hw, 2.5, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 5, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            {/* Right post */}
            <mesh position={[hw, 2.5, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 5, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            {/* Top beam */}
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[ROAD_WIDTH + 1, 0.3, 0.3]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.9} />
            </mesh>
            {/* Transparent trigger plane — visual only */}
            <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
              <planeGeometry args={[ROAD_WIDTH, 4]} />
              <meshStandardMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
            </mesh>
            {/* CP number */}
            <mesh position={[0, 5.6, 0]}>
              <boxGeometry args={[2, 0.8, 0.1]} />
              <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function DesertScenery() {
  const rocks = [
    [-80, -80], [-90, -200], [320, -50],
    [320, -200], [-70, 260], [320, 200],
    [150, 280], [-80, 150], [280, -210],
  ]
  return (
    <>
      {rocks.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <dodecahedronGeometry args={[3 + (i % 4) * 2, 0]} />
          <meshStandardMaterial color="#a0845c" roughness={1} />
        </mesh>
      ))}
      {[[-120, 50], [340, 100], [160, 300], [-100, -250]].map(([x, z], i) => (
        <mesh key={`dune-${i}`} position={[x, 0, z]}>
          <sphereGeometry args={[18 + i * 6, 7, 5]} />
          <meshStandardMaterial color="#c9a84c" roughness={1} />
        </mesh>
      ))}
    </>
  )
}

export default function DesertRun() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[50, 80, 50]} intensity={1.2} />

      {/* Sandy ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, -0.05, 30]}>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color="#d4a853" roughness={1} />
      </mesh>

      <TrackSurface />
      <CenterLine />
      <GuardRails />
      <FinishLine />
      <CheckpointGates />
      <DesertScenery />
    </>
  )
}