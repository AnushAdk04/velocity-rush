'use client'

import GhostCar from './GhostCar'

const AI_CARS = [
  { startWaypoint: 0,  speed: 16, color: '#4361ee' },
  { startWaypoint: 4,  speed: 19, color: '#f77f00' },
  { startWaypoint: 8,  speed: 17, color: '#06d6a0' },
  { startWaypoint: 12, speed: 20, color: '#9b5de5' },
  { startWaypoint: 16, speed: 15, color: '#ffffff' },
]

export default function AIManager() {
  return (
    <>
      {AI_CARS.map((car, i) => (
        <GhostCar
          key={i}
          startWaypoint={car.startWaypoint}
          speed={car.speed}
          color={car.color}
        />
      ))}
    </>
  )
}