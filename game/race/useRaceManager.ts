import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DESERT_RUN_CHECKPOINTS,
  FINISH_LINE,
} from '../tracks/checkpoints'
import { useGameStore } from '../../store/useGameStore'

export function useRaceManager(
  carRef: React.RefObject<THREE.Group>
) {
  const nextCheckpoint = useRef(0)
  const lapStartTime = useRef(0)
  const allCheckpointsHit = useRef(false)
  const crossedFinish = useRef(false)  // debounce finish line

  useFrame(() => {
    const car = carRef.current
    if (!car) return

    const { currentLap, totalLaps, raceTime, phase } = useGameStore.getState()

    if (phase !== 'racing') return

    const pos = car.position
    const checkpoints = DESERT_RUN_CHECKPOINTS

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
          FINISH_LINE.pos.x, 0, FINISH_LINE.pos.z
        ))

      if (dist < FINISH_LINE.radius && !crossedFinish.current) {
        crossedFinish.current = true

        const lapTime = raceTime - lapStartTime.current
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
      if (dist > FINISH_LINE.radius * 1.5) {
        crossedFinish.current = false
      }
    }
  })

  return { nextCheckpoint }
}