import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS } from '../tracks/checkpoints'
import { NEON_CITY_WAYPOINTS } from '../tracks/NeonCityCheckpoints'
import { MOUNTAIN_WAYPOINTS } from '../tracks/MountainCheckpoints'
import { useGameStore } from '../../store/useGameStore'
function getWaypoints() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') return NEON_CITY_WAYPOINTS
  if (track === 'mountain') return MOUNTAIN_WAYPOINTS
  return DESERT_RUN_WAYPOINTS
}
// Returns 0-1 progress along the track for any position
function getTrackProgress(pos: THREE.Vector3, lap: number, totalLaps: number): number {
  const pts = getWaypoints()
  const n = pts.length

  // Find closest waypoint
  let minDist = Infinity
  let closestIdx = 0
  for (let i = 0; i < n; i++) {
    const d = new THREE.Vector3(pts[i].x, 0, pts[i].z)
      .distanceTo(new THREE.Vector3(pos.x, 0, pos.z))
    if (d < minDist) { minDist = d; closestIdx = i }
  }

  // Fractional progress between this waypoint and next
  const nextIdx = (closestIdx + 1) % n
  const segStart = new THREE.Vector3(pts[closestIdx].x, 0, pts[closestIdx].z)
  const segEnd = new THREE.Vector3(pts[nextIdx].x, 0, pts[nextIdx].z)
  const segLen = segStart.distanceTo(segEnd)
  const carPos = new THREE.Vector3(pos.x, 0, pos.z)
  const fraction = segLen > 0
    ? Math.max(0, Math.min(1, carPos.distanceTo(segStart) / segLen))
    : 0

  // Combine: lap progress + waypoint fraction within lap
  const waypointProgress = (closestIdx + fraction) / n
  const lapProgress = (lap - 1) / totalLaps
  return lapProgress + waypointProgress / totalLaps
}

// AI position tracker — stores positions for all AI cars
const aiPositions: THREE.Vector3[] = []

export function registerAIPosition(index: number, pos: THREE.Vector3) {
  aiPositions[index] = pos.clone()
}

export function usePositionTracker(
  carRef: React.RefObject<THREE.Group>
) {
  const updateTimer = useRef(0)

  useFrame((_, delta) => {
    updateTimer.current -= delta
    if (updateTimer.current > 0) return
    updateTimer.current = 0.5  // recalculate every 0.5s

    const car = carRef.current
    if (!car) return

    const { currentLap, totalLaps } = useGameStore.getState()
    const playerProgress = getTrackProgress(car.position, currentLap, totalLaps)

    // Count how many AIs are ahead of player
    let position = 1
    aiPositions.forEach((aiPos) => {
      if (!aiPos) return
      // AI always on lap 1 for simplicity — improve later with lap tracking
      const aiProgress = getTrackProgress(aiPos, 1, totalLaps)
      if (aiProgress > playerProgress) position++
    })

    useGameStore.setState({ position: Math.min(position, 6) })
  })
}

export { getTrackProgress }