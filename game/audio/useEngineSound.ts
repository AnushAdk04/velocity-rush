import { useEffect, useRef } from 'react'

export function useEngineSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const distortionRef = useRef<WaveShaperNode | null>(null)
  const startedRef = useRef(false)

  function makeDistortionCurve(amount: number) {
    const samples = 256
    const curve = new Float32Array(samples)
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x))
    }
    return curve
  }

  function start() {
    if (startedRef.current) return
    startedRef.current = true

    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    // Main oscillator — sawtooth for engine growl
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 40  // idle frequency

    // Second oscillator for harmonic richness
    const osc2 = ctx.createOscillator()
    osc2.type = 'square'
    osc2.frequency.value = 80

    // Distortion for grittiness
    const distortion = ctx.createWaveShaper()
    distortion.curve = makeDistortionCurve(80)
    distortion.oversample = '4x'
    distortionRef.current = distortion

    // Low pass filter — cuts harsh highs
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 1.5

    // Gain
    const gain = ctx.createGain()
    gain.gain.value = 0  // start silent
    gainRef.current = gain

    const gain2 = ctx.createGain()
    gain2.gain.value = 0.3

    // Connect graph
    osc.connect(distortion)
    osc2.connect(gain2)
    gain2.connect(distortion)
    distortion.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc2.start()
    oscillatorRef.current = osc

    // Store osc2 freq ref for updates
    ;(gainRef.current as any)._osc = osc
    ;(gainRef.current as any)._osc2 = osc2
    ;(gainRef.current as any)._filter = filter
  }

  function update(speedKmh: number, gear: number) {
    const gain = gainRef.current
    if (!gain || !audioCtxRef.current) return

    const ctx = audioCtxRef.current
    const osc = (gain as any)._osc as OscillatorNode
    const osc2 = (gain as any)._osc2 as OscillatorNode
    const filter = (gain as any)._filter as BiquadFilterNode
    if (!osc || !osc2) return

    const now = ctx.currentTime

    // Engine frequency based on speed within gear band
    // Each gear: frequency cycles from low to high then drops on shift
    const gearSpeedRange = 37  // km/h per gear
    const speedInGear = speedKmh % gearSpeedRange
    const rpmRatio = speedInGear / gearSpeedRange  // 0-1 within gear

    // Base frequency per gear (higher gears = higher base pitch)
    const gearBase = [40, 55, 70, 85, 95, 105][Math.min(gear - 1, 5)]
    const freq = gearBase + rpmRatio * 60

    osc.frequency.setTargetAtTime(freq, now, 0.05)
    osc2.frequency.setTargetAtTime(freq * 2, now, 0.05)

    // Volume — quiet at idle, louder at speed
    const targetGain = speedKmh < 2
      ? 0.04   // idle hum
      : 0.12 + (speedKmh / 220) * 0.08

    gain.gain.setTargetAtTime(targetGain, now, 0.08)

    // Filter opens up at high rpm (engine screams)
    const filterFreq = 400 + rpmRatio * 1200
    filter.frequency.setTargetAtTime(filterFreq, now, 0.1)
  }

  function stop() {
    gainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 0.3)
    setTimeout(() => {
      oscillatorRef.current?.stop()
      audioCtxRef.current?.close()
      startedRef.current = false
    }, 500)
  }

  return { start, update, stop }
}