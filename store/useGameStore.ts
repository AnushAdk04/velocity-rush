import { create } from 'zustand'

export type GamePhase = 'menu' | 'countdown' | 'racing' | 'finished'

interface GameStore {
  // Race state
  phase: GamePhase
  currentLap: number
  totalLaps: number
  position: number        // player's race position (1st, 2nd...)
  totalRacers: number
  raceTime: number        // seconds elapsed
  bestLapTime: number | null

  // Vehicle state (read by HUD)
  speed: number           // km/h
  rpm: number
  currentGear: number


  // Camera
  cameraMode: 'third' | 'cockpit'

  // Actions
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
  currentLap: 1,
  totalLaps: 3,
  position: 1,
  totalRacers: 6,
  raceTime: 0,
  bestLapTime: null,
  speed: 0,
  rpm: 0,
  currentGear: 0,
  cameraMode: 'third' as const,

  setPhase: (phase) => set({ phase }),
  setSpeed: (speed) => set({ speed }),
  setRpm: (rpm) => set({ rpm }),
  setCurrentGear: (currentGear) => set({ currentGear }),
  incrementLap: () => set((s) => ({ currentLap: s.currentLap + 1 })),
  setPosition: (position) => set({ position }),
  toggleCamera: () =>
    set((s) => ({ cameraMode: s.cameraMode === 'third' ? 'cockpit' : 'third' })),
  tickTime: (delta) => set((s) => ({ raceTime: s.raceTime + delta })),
}))