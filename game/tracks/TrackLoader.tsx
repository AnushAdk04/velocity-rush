'use client'

import { useGameStore } from '../../store/useGameStore'
import DesertRun from './DesertRun'
import NeonCity from './NeonCity'
import MountainCircuit from './MountainCircuit'

export default function TrackLoader() {
  const currentTrack = useGameStore((s) => s.currentTrack)

  switch (currentTrack) {
    case 'neon':     return <NeonCity />
    case 'mountain': return <MountainCircuit />
    default:         return <DesertRun />
  }
}