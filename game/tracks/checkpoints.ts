import { Vector3 } from 'three'

// Desert Run — wide oval, ~800m per lap
// These are the CENTER LINE points of the road
export const DESERT_RUN_WAYPOINTS: Vector3[] = [
  new Vector3(0, 0.5, 0),
  new Vector3(0, 0.5, -80),
  new Vector3(0, 0.5, -160),
  new Vector3(20, 0.5, -220),
  new Vector3(60, 0.5, -260),
  new Vector3(120, 0.5, -280),
  new Vector3(180, 0.5, -270),
  new Vector3(220, 0.5, -240),
  new Vector3(240, 0.5, -180),
  new Vector3(240, 0.5, -100),
  new Vector3(240, 0.5, 0),
  new Vector3(240, 0.5, 80),
  new Vector3(220, 0.5, 140),
  new Vector3(180, 0.5, 170),
  new Vector3(120, 0.5, 180),
  new Vector3(60, 0.5, 170),
  new Vector3(20, 0.5, 140),
  new Vector3(0, 0.5, 80),
]

// Checkpoints — subset of waypoints used for lap validation
// Player must pass through ALL of these to complete a lap
export const DESERT_RUN_CHECKPOINTS: Vector3[] = [
  new Vector3(0, 0.5, -160),    // checkpoint 1 — end of first straight
  new Vector3(240, 0.5, -180),  // checkpoint 2 — far end turn
  new Vector3(240, 0.5, 80),    // checkpoint 3 — return straight
  new Vector3(120, 0.5, 180),   // checkpoint 4 — final turn
]

// Start/finish line position
export const START_POSITION = new Vector3(0, 1, 20)
export const START_ROTATION_Y = Math.PI // facing down the Z axis