import { Vector3 } from 'three'

export interface CarStats {
  id: string
  name: string
  topSpeed: number        // km/h
  acceleration: number    // 0-1 scale
  braking: number
  handling: number
  grip: number
  weight: number
  horsepower: number
  torque: number
  driftFactor: number
}

export interface Track {
  id: string
  name: string
  checkpoints: Vector3[]
  waypoints: Vector3[]    // AI follows these
  lapCount: number
  environment: 'desert' | 'city' | 'mountain'
}

export interface AIController {
  currentWaypoint: number
  targetSpeed: number
  aggression: number      // 0-1
  reactionTime: number    // seconds
}

// Default car for Phase 1
export const DESERT_HAWK: CarStats = {
  id: 'desert-hawk',
  name: 'Desert Hawk',
  topSpeed: 220,
  acceleration: 0.7,
  braking: 0.8,
  handling: 0.65,
  grip: 0.7,
  weight: 1200,
  horsepower: 320,
  torque: 400,
  driftFactor: 0.3,
}