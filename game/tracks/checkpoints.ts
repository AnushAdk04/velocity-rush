import { Vector3 } from 'three'

// Clean non-overlapping F1-style circuit
// Flows: start straight → right hairpin → long back straight → 
//        left sweeper → esses → return straight → start
export const DESERT_RUN_WAYPOINTS: Vector3[] = [
  // Start / finish straight (going north = negative Z)
  new Vector3(0,   0.5,  50),
  new Vector3(0,   0.5,  0),
  new Vector3(0,   0.5, -50),
  new Vector3(0,   0.5, -100),

  // Turn 1 — wide right sweeper
  new Vector3(40,  0.5, -150),
  new Vector3(100, 0.5, -170),
  new Vector3(160, 0.5, -170),

  // Turn 2 — tighter right
  new Vector3(210, 0.5, -150),
  new Vector3(230, 0.5, -100),

  // Back straight (going south = positive Z)
  new Vector3(230, 0.5, -50),
  new Vector3(230, 0.5,  20),
  new Vector3(230, 0.5,  90),
  new Vector3(230, 0.5, 160),

  // Turn 3 — left hairpin
  new Vector3(200, 0.5, 210),
  new Vector3(150, 0.5, 230),
  new Vector3(100, 0.5, 220),
  new Vector3(70,  0.5, 190),

  // Sweeping left back toward start
  new Vector3(60,  0.5, 140),
  new Vector3(60,  0.5,  90),
  new Vector3(60,  0.5,  40),

  // Final turn — left onto start straight
  new Vector3(40,  0.5,  10),
  new Vector3(20,  0.5,  30),
  new Vector3(0,   0.5,  50),
]

export const DESERT_RUN_CHECKPOINTS: { pos: Vector3; radius: number }[] = [
  { pos: new Vector3(0,   0, -80),  radius: 20 }, // CP1 start straight
  { pos: new Vector3(160, 0, -170), radius: 20 }, // CP2 top straight
  { pos: new Vector3(230, 0,  90),  radius: 20 }, // CP3 back straight
  { pos: new Vector3(120, 0, 225),  radius: 20 }, // CP4 hairpin
  { pos: new Vector3(60,  0,  90),  radius: 20 }, // CP5 return
]

export const FINISH_LINE = {
  pos: new Vector3(0, 0, 20),
  radius: 16,
}

export const START_POSITION = new Vector3(0, 0.4, 50)
export const START_ROTATION_Y = Math.PI