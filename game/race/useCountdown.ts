import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/useGameStore'

export function useCountdown() {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    // Set to countdown phase
    useGameStore.setState({
      phase: 'countdown',
      countdownValue: 3,
    })

    const tick = (n: number) => {
      useGameStore.setState({ countdownValue: n })
      if (n > 0) {
        setTimeout(() => tick(n - 1), 1000)
      } else {
        // GO!
        setTimeout(() => {
          useGameStore.setState({
            phase: 'racing',
            countdownValue: 0,
          })
        }, 800)
      }
    }

    setTimeout(() => tick(3), 500)
  }, [])
}