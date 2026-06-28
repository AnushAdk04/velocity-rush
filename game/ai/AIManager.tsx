'use client'

import GhostCar from './GhostCar'

const GRID = [
  { offset: [-6,  60], speed: 17, color: '#4361ee' },
  { offset: [ 6,  75], speed: 16, color: '#f77f00' },
  { offset: [-6,  75], speed: 18, color: '#06d6a0' },
  { offset: [ 6,  90], speed: 15, color: '#9b5de5' },
  { offset: [-6,  90], speed: 19, color: '#ffffff' },
]

export default function AIManager() {
  return (
    <>
      {GRID.map((car, i) => (
        <GhostCar
          key={i}
          index={i}
          startX={car.offset[0]}
          startZ={car.offset[1]}
          speed={car.speed}
          color={car.color}
        />
      ))}
    </>
  )
}