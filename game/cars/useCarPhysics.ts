import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

// Gear ratios — each gear has a speed range (m/s) and acceleration multiplier
const GEARS = [
  { min: 0,  max: 8,  accelMult: 1.0 },   // 1st — 0-29 km/h
  { min: 8,  max: 16, accelMult: 0.85 },  // 2nd — 29-58 km/h
  { min: 16, max: 24, accelMult: 0.70 },  // 3rd — 58-86 km/h
  { min: 24, max: 32, accelMult: 0.55 },  // 4th — 86-115 km/h
  { min: 32, max: 40, accelMult: 0.40 },  // 5th — 115-144 km/h
  { min: 40, max: 55, accelMult: 0.28 },  // 6th — 144-200 km/h
]

function getGear(speed: number): number {
  const absSpeed = Math.abs(speed)
  for (let i = 0; i < GEARS.length; i++) {
    if (absSpeed >= GEARS[i].min && absSpeed < GEARS[i].max) return i
  }
  return GEARS.length - 1
}

interface CarPhysicsOptions {
  topSpeed?: number
  acceleration?: number
  braking?: number
  handling?: number
  grip?: number
  gravity?: number
}

export function useCarPhysics(
  carRef: React.RefObject<THREE.Group>,
  options: CarPhysicsOptions = {}
) {
  const {
    topSpeed = 55,
    acceleration = 12,   // slower base acceleration
    braking = 28,
    handling = 1.4,      // reduced from 2.0
    grip = 0.88,
    gravity = 20,
  } = options

  const velocity = useRef(new THREE.Vector3())
  const speed = useRef(0)
  const yVelocity = useRef(0)
  const currentGear = useRef(0)
  const gearChangeTimer = useRef(0)  // prevent gear hunting

  const [, getKeys] = useKeyboardControls()

  useFrame((_, delta) => {
    const car = carRef.current
    if (!car) return

    const dt = Math.min(delta, 0.05)
    const keys = getKeys()

    const absSpeed = Math.abs(speed.current)
    const gear = getGear(absSpeed)

    // Smooth gear change — debounce by 0.3s
    gearChangeTimer.current -= dt
    if (gear !== currentGear.current && gearChangeTimer.current <= 0) {
      currentGear.current = gear
      gearChangeTimer.current = 0.3
    }

    const gearAccelMult = GEARS[currentGear.current].accelMult

    // --- Engine force with gear multiplier ---
    if (keys.forward) {
      // Acceleration tapers off in higher gears
      speed.current = Math.min(
        speed.current + acceleration * gearAccelMult * dt,
        topSpeed
      )
    } else if (keys.backward) {
      if (speed.current > 0.5) {
        // Engine braking when moving forward
        speed.current = Math.max(speed.current - braking * dt, 0)
      } else {
        // Reverse
        speed.current = Math.max(speed.current - (acceleration * 0.5) * dt, -topSpeed * 0.35)
      }
    } else {
      // Gentle coast deceleration
      speed.current *= (1 - 1.8 * dt)
      if (Math.abs(speed.current) < 0.05) speed.current = 0
    }

    if (keys.brake) {
      speed.current *= (1 - 10 * dt)
    }

    // --- Steering — scales with speed, less twitchy ---
    const speedRatio = Math.min(absSpeed / topSpeed, 1)
    // High speed = less steering angle (like a real car)
    const steerAmount = handling * (1 - speedRatio * 0.5) * dt

    if (Math.abs(speed.current) > 0.5) {
      const dir = speed.current > 0 ? 1 : -1
      if (keys.left) car.rotation.y += steerAmount * dir
      if (keys.right) car.rotation.y -= steerAmount * dir
    }

    // --- Movement ---
    const carForward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(car.quaternion)
    const targetVelocity = carForward.multiplyScalar(speed.current)
    velocity.current.lerp(targetVelocity, grip)

    // --- Gravity ---
    yVelocity.current -= gravity * dt
    if (car.position.y - 0.4 <= 0) {
      car.position.y = 0.4
      yVelocity.current = 0
    }

    // --- Apply ---
    car.position.x += velocity.current.x * dt
    car.position.z += velocity.current.z * dt
    car.position.y += yVelocity.current * dt
  })

  return { velocity, speed, currentGear }
}