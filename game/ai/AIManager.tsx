'use client'

import GhostCar from './GhostCar'

// Grid positions — 2 columns behind start line
// Player is at Z=50, so AI start at Z=60, 75, 90 (behind player)
// Alternating left/right of center like a real F1 grid
const GRID = [
  { offset: [-6,  60], speed: 17, color: '#4361ee' }, // P2 — left
  { offset: [ 6,  75], speed: 16, color: '#f77f00' }, // P3 — right
  { offset: [-6,  75], speed: 18, color: '#06d6a0' }, // P4 — left
  { offset: [ 6,  90], speed: 15, color: '#9b5de5' }, // P5 — right
  { offset: [-6,  90], speed: 19, color: '#ffffff' }, // P6 — left
]

export default function AIManager() {
  return (
    <>
      {GRID.map((car, i) => (
        <GhostCar
          key={i}
          startX={car.offset[0]}
          startZ={car.offset[1]}
          speed={car.speed}
          color={car.color}
        />
      ))}
    </>
  )
}