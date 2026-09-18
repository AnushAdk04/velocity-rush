import { create } from 'zustand'

export type GamePhase = 'menu' | 'trackselect' | 'countdown' | 'racing' | 'finished'

interface GameStore {
  phase: GamePhase
  countdownValue: number
  currentLap: number
  totalLaps: number
  position: number
  totalRacers: number
  raceTime: number
  bestLapTime: number | null
  speed: number
  rpm: number
  currentGear: number
  cameraMode: 'third' | 'cockpit'
  currentTrack: 'desert' | 'neon' | 'mountain'
  
  setTrack: (track: 'desert' | 'neon' | 'mountain') => void
  setPhase: (phase: GamePhase) => void
  setSpeed: (speed: number) => void
  setRpm: (rpm: number) => void
  setCurrentGear: (gear: number) => void
  incrementLap: () => void
  setPosition: (pos: number) => void
  toggleCamera: () => void
  tickTime: (delta: number) => void
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'menu',
  countdownValue: 3,
  currentLap: 1,
  totalLaps: 3,
  position: 1,
  totalRacers: 6,
  raceTime: 0,
  bestLapTime: null,
  speed: 0,
  rpm: 0,
  currentGear: 0,
  cameraMode: 'third',
  currentTrack: 'desert',
  setTrack: (track) => set({ currentTrack: track }),
  setPhase: (phase) => set({ phase }),
  setSpeed: (speed) => set({ speed }),
  setRpm: (rpm) => set({ rpm }),
  setCurrentGear: (currentGear) => set({ currentGear }),
  incrementLap: () => set((s) => ({ currentLap: s.currentLap + 1 })),
  setPosition: (position) => set({ position }),
  toggleCamera: () => set((s) => ({
    cameraMode: s.cameraMode === 'third' ? 'cockpit' : 'third'
  })),
  tickTime: (delta) => set((s) => ({ raceTime: s.raceTime + delta })),
}))