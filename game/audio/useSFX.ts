import { Howl } from 'howler'
import { useRef } from 'react'

// Generates a short beep programmatically using data URI
function makeToneDataURI(freq: number, duration: number, type: OscillatorType = 'sine'): string {
  const sampleRate = 44100
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.max(0, 1 - t / duration)
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.8
    view.setInt16(44 + i * 2, sample * 32767, true)
  }

  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

export function useSFX() {
  const sounds = useRef<Record<string, Howl>>({})
  const initialized = useRef(false)

  function init() {
    if (initialized.current) return
    initialized.current = true

    // Checkpoint beep — rising tone
    sounds.current.checkpoint = new Howl({
      src: [makeToneDataURI(880, 0.15)],
      volume: 0.6,
      format: ['wav'],
    })

    // Lap complete — two tones
    sounds.current.lap = new Howl({
      src: [makeToneDataURI(660, 0.3)],
      volume: 0.8,
      format: ['wav'],
    })

    // Countdown beep
    sounds.current.beep = new Howl({
      src: [makeToneDataURI(440, 0.2)],
      volume: 0.7,
      format: ['wav'],
    })

    // GO! beep — higher
    sounds.current.go = new Howl({
      src: [makeToneDataURI(880, 0.4)],
      volume: 0.9,
      format: ['wav'],
    })
  }

  function play(name: string) {
    init()
    sounds.current[name]?.play()
  }

  return { play, init }
}