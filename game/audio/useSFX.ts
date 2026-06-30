import { Howl } from 'howler'
import { useRef } from 'react'

function makeToneDataURI(freq: number, duration: number): string {
  const sampleRate = 44100
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)
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

// White noise generator for tire screech
function makeScreechDataURI(duration: number): string {
  const sampleRate = 44100
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)
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
    // Filtered noise — mix of noise frequencies for tire screech
    const noise = (Math.random() * 2 - 1)
    const tone = Math.sin(2 * Math.PI * 180 * t) * 0.3
    const envelope = Math.min(t * 8, 1) * Math.max(0, 1 - t / duration * 0.3)
    const sample = (noise * 0.7 + tone) * envelope * 0.5
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true)
  }
  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

export function useSFX() {
  const sounds = useRef<Record<string, Howl>>({})
  const initialized = useRef(false)
  const screechPlaying = useRef(false)

  function init() {
    if (initialized.current) return
    initialized.current = true

    sounds.current.checkpoint = new Howl({
      src: [makeToneDataURI(880, 0.15)],
      volume: 0.6, format: ['wav'],
    })
    sounds.current.lap = new Howl({
      src: [makeToneDataURI(660, 0.3)],
      volume: 0.8, format: ['wav'],
    })
    sounds.current.beep = new Howl({
      src: [makeToneDataURI(440, 0.2)],
      volume: 0.7, format: ['wav'],
    })
    sounds.current.go = new Howl({
      src: [makeToneDataURI(880, 0.4)],
      volume: 0.9, format: ['wav'],
    })
    sounds.current.screech = new Howl({
      src: [makeScreechDataURI(2.0)],
      volume: 0, format: ['wav'],
      loop: true,
    })
  }

  function play(name: string) {
    init()
    sounds.current[name]?.play()
  }

  // Call every frame with braking/sliding intensity 0-1
  function updateScreech(intensity: number) {
    init()
    const s = sounds.current.screech
    if (!s) return

    if (intensity > 0.05) {
      if (!screechPlaying.current) {
        s.play()
        screechPlaying.current = true
      }
      s.volume(Math.min(intensity * 0.7, 0.7))
    } else {
      if (screechPlaying.current) {
        s.volume(0)
        s.stop()
        screechPlaying.current = false
      }
    }
  }

  return { play, init, updateScreech }
}