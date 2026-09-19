'use client'

import GhostCar from './GhostCar'
import { useGameStore } from '../../store/useGameStore'

type GridCar = { offset: [number, number]; speed: number; color: string }

const GRIDS: Record<string, GridCar[]> = {
  desert: [
    { offset: [-6, 60], speed: 17, color: '#4361ee' },
    { offset: [6, 75], speed: 16, color: '#f77f00' },
    { offset: [-6, 75], speed: 18, color: '#06d6a0' },
    { offset: [6, 90], speed: 15, color: '#9b5de5' },
    { offset: [-6, 90], speed: 19, color: '#ffffff' },
  ],
  neon: [
    { offset: [-6, 60], speed: 13, color: '#4361ee' },
    { offset: [6, 75], speed: 12, color: '#f77f00' },
    { offset: [-6, 75], speed: 14, color: '#06d6a0' },
    { offset: [6, 90], speed: 11, color: '#9b5de5' },
    { offset: [-6, 90], speed: 15, color: '#ffffff' },
  ],
  mountain: [
    { offset: [-6, 60], speed: 15, color: '#4361ee' },
    { offset: [6, 75], speed: 14, color: '#f77f00' },
    { offset: [-6, 75], speed: 16, color: '#06d6a0' },
    { offset: [6, 90], speed: 13, color: '#9b5de5' },
    { offset: [-6, 90], speed: 17, color: '#ffffff' },
  ],
}

export default function AIManager() {
  const track = useGameStore((s) => s.currentTrack)
  const grid = GRIDS[track] ?? GRIDS.desert

  return (
    <>
      {grid.map((car, i) => (
        <GhostCar
          key={`${track}-${i}`}
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