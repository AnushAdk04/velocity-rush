'use client'

import GhostCar from './GhostCar'

// 5 opponents, spread across the track, different speeds + colors
const AI_CARS = [
  { startWaypoint: 0,  speed: 16, color: '#4361ee' },  // blue
  { startWaypoint: 3,  speed: 19, color: '#f77f00' },  // orange
  { startWaypoint: 6,  speed: 17, color: '#06d6a0' },  // teal
  { startWaypoint: 9,  speed: 20, color: '#9b5de5' },  // purple
  { startWaypoint: 12, speed: 15, color: '#ffffff' },  // white
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