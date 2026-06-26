'use client'

import * as THREE from 'three'
import { useMemo } from 'react'
import { DESERT_RUN_WAYPOINTS } from './checkpoints'

function TrackSurface() {
  const ROAD_WIDTH = 18

  const { geometry } = useMemo(() => {
    const points = DESERT_RUN_WAYPOINTS
    const vertices: number[] = []
    const indices: number[] = []
    const uvs: number[] = []

    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]

      const dir = new THREE.Vector3()
        .subVectors(next, current)
        .normalize()

      const right = new THREE.Vector3(-dir.z, 0, dir.x)
      const lv = current.clone().add(right.clone().multiplyScalar(-ROAD_WIDTH / 2))
      const rv = current.clone().add(right.clone().multiplyScalar(ROAD_WIDTH / 2))

      vertices.push(lv.x, 0.01, lv.z)
      vertices.push(rv.x, 0.01, rv.z)

      const t = i / points.length
      uvs.push(0, t)
      uvs.push(1, t)
    }

    for (let i = 0; i < points.length; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = ((i + 1) % points.length) * 2
      const d = ((i + 1) % points.length) * 2 + 1
      indices.push(a, b, c)
      indices.push(b, d, c)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return { geometry: geo }
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#c8a96e" roughness={0.9} />
    </mesh>
  )
}

function DesertProps() {
  const rocks = [
    [-30, 0, -100], [280, 0, -200], [-20, 0, 100],
    [300, 0, 50], [260, 0, -300], [-40, 0, -250],
    [-50, 0, -50], [310, 0, -100], [270, 0, 200],
  ]

  return (
    <>
      {rocks.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y as number, z]}>
          <dodecahedronGeometry args={[2 + (i % 3) * 1.5, 0]} />
          <meshStandardMaterial color="#a0845c" roughness={1} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, 0, -50]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#d4a853" roughness={1} />
      </mesh>

      {/* Track surface */}
      <TrackSurface />

      {/* Start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 10]}>
        <planeGeometry args={[18, 2]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Desert rocks */}
      <DesertProps />
    </>
  )
}