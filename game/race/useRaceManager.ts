import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DESERT_RUN_CHECKPOINTS,
  FINISH_LINE,
} from '../tracks/checkpoints'
import {
  NEON_CITY_CHECKPOINTS,
  NEON_FINISH_LINE,
} from '../tracks/NeonCityCheckpoints'
import {
  MOUNTAIN_CHECKPOINTS,
  MOUNTAIN_FINISH_LINE,
} from '../tracks/MountainCheckpoints'
import { useGameStore } from '../../store/useGameStore'

function getRaceTrack() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') {
    return { checkpoints: NEON_CITY_CHECKPOINTS, finishLine: NEON_FINISH_LINE }
  }
  if (track === 'mountain') {
    return { checkpoints: MOUNTAIN_CHECKPOINTS, finishLine: MOUNTAIN_FINISH_LINE }
  }
  return { checkpoints: DESERT_RUN_CHECKPOINTS, finishLine: FINISH_LINE }
}

export function useRaceManager(
  carRef: React.RefObject<THREE.Group>
) {
  const nextCheckpoint = useRef(0)
  const lapStartTime = useRef(0)
  const allCheckpointsHit = useRef(false)
  const crossedFinish = useRef(false)
  const previousPhase = useRef(useGameStore.getState().phase)
  const previousTrack = useRef(useGameStore.getState().currentTrack)

  useFrame(() => {
    const car = carRef.current
    if (!car) return

    const { currentLap, totalLaps, raceTime, phase, currentTrack } = useGameStore.getState()

    if (previousTrack.current !== currentTrack) {
      previousTrack.current = currentTrack
      nextCheckpoint.current = 0
      lapStartTime.current = 0
      allCheckpointsHit.current = false
      crossedFinish.current = false
    }

    if (phase === 'countdown' && previousPhase.current !== 'countdown') {
      nextCheckpoint.current = 0
      lapStartTime.current = 0
      allCheckpointsHit.current = false
      crossedFinish.current = false
    }
    previousPhase.current = phase

    if (phase !== 'racing') return

    const pos = car.position
    const { checkpoints, finishLine } = getRaceTrack()

    // Check next checkpoint
    if (nextCheckpoint.current < checkpoints.length) {
      const cp = checkpoints[nextCheckpoint.current]
      const dist = new THREE.Vector3(pos.x, 0, pos.z)
        .distanceTo(new THREE.Vector3(cp.pos.x, 0, cp.pos.z))

      if (dist < cp.radius) {
        nextCheckpoint.current += 1
        if (nextCheckpoint.current >= checkpoints.length) {
          allCheckpointsHit.current = true
        }
      }
    }

    // Check finish line
    if (allCheckpointsHit.current) {
      const dist = new THREE.Vector3(pos.x, 0, pos.z)
        .distanceTo(new THREE.Vector3(
          finishLine.pos.x, 0, finishLine.pos.z
        ))

      if (dist < finishLine.radius && !crossedFinish.current) {
        crossedFinish.current = true

        const lapTime = Math.max(0, raceTime - lapStartTime.current)
        lapStartTime.current = raceTime

        // Update best lap time directly via setState
        useGameStore.setState((s) => ({
          bestLapTime: s.bestLapTime === null || lapTime < s.bestLapTime
            ? lapTime
            : s.bestLapTime
        }))

        // Reset for next lap
        nextCheckpoint.current = 0
        allCheckpointsHit.current = false

        if (currentLap >= totalLaps) {
          useGameStore.setState({ phase: 'finished' })
        } else {
          useGameStore.setState((s) => ({ currentLap: s.currentLap + 1 }))
        }
      }

      // Reset finish line debounce once car moves away
      if (dist > finishLine.radius * 1.5) {
        crossedFinish.current = false
      }
    }
  })

  return { nextCheckpoint }
}