'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useSFX } from './useSFX'

export default function AudioManager() {
  const sfx = useSFX()
  const lastPhase = useRef('')
  const lastCountdown = useRef(-1)
  const lastLap = useRef(1)

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      // Countdown beeps
      if (state.phase === 'countdown') {
        if (state.countdownValue !== lastCountdown.current && state.countdownValue > 0) {
          lastCountdown.current = state.countdownValue
          sfx.play('beep')
        }
        if (state.countdownValue === 0 && lastCountdown.current !== 0) {
          lastCountdown.current = 0
          sfx.play('go')
        }
      }

      // Lap complete sound
      if (state.currentLap !== lastLap.current && state.phase === 'racing') {
        lastLap.current = state.currentLap
        sfx.play('lap')
      }

      lastPhase.current = state.phase
    })

    return () => unsub()
  }, [])

  return null
}