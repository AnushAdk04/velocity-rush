import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

interface CarPhysicsOptions {
  topSpeed?: number        // m/s (~200 km/h = 55)
  acceleration?: number   // force per frame
  braking?: number
  handling?: number       // steering speed
  grip?: number           // 0-1, how much lateral drift
  gravity?: number
}

export function useCarPhysics(
  carRef: React.RefObject<THREE.Group>,
  options: CarPhysicsOptions = {}
) {
  const {
    topSpeed = 40,
    acceleration = 25,
    braking = 35,
    handling = 2.2,
    grip = 0.88,
    gravity = 20,
  } = options

  const velocity = useRef(new THREE.Vector3())
  const speed = useRef(0)         // forward speed (signed)
  const yVelocity = useRef(0)     // vertical velocity for gravity

  const [, getKeys] = useKeyboardControls()

  useFrame((_, delta) => {
    const car = carRef.current
    if (!car) return

    // Cap delta to avoid spiral of death on tab switch
    const dt = Math.min(delta, 0.05)

    const keys = getKeys()
    const forward = keys.forward
    const backward = keys.backward
    const left = keys.left
    const right = keys.right
    const brake = keys.brake

    // --- Engine force ---
    if (forward) {
      speed.current = Math.min(
        speed.current + acceleration * dt,
        topSpeed
      )
    } else if (backward) {
      speed.current = Math.max(
        speed.current - braking * dt,
        -topSpeed * 0.4   // reverse is slower
      )
    } else {
      // Natural deceleration
      speed.current *= (1 - 2.5 * dt)
      if (Math.abs(speed.current) < 0.1) speed.current = 0
    }

    // Brake
    if (brake) {
      speed.current *= (1 - 8 * dt)
    }

    // --- Steering ---
    // Only steer when moving, scale with speed
    const speedRatio = Math.min(Math.abs(speed.current) / topSpeed, 1)
    const steerAmount = handling * speedRatio * dt

    if ((left || right) && Math.abs(speed.current) > 0.5) {
      const dir = speed.current > 0 ? 1 : -1
      if (left) car.rotation.y += steerAmount * dir
      if (right) car.rotation.y -= steerAmount * dir
    }

    // --- Movement ---
    // Get car's forward direction
    const carForward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(car.quaternion)

    // Target velocity = forward direction * speed
    const targetVelocity = carForward.multiplyScalar(speed.current)

    // Blend current velocity toward target (grip simulation)
    // Low grip = more drift (lateral velocity preserved longer)
    velocity.current.lerp(targetVelocity, grip)

    // --- Gravity ---
    yVelocity.current -= gravity * dt

    // Ground check — simple flat ground at y=0
    const groundY = 0
    const carBottomY = car.position.y - 0.4  // car half-height

    if (carBottomY <= groundY) {
      car.position.y = groundY + 0.4
      yVelocity.current = 0
    }

    // --- Apply movement ---
    car.position.x += velocity.current.x * dt
    car.position.z += velocity.current.z * dt
    car.position.y += yVelocity.current * dt

    // Expose speed in km/h for HUD
    return Math.abs(speed.current) * 3.6
  })

  return { velocity, speed }
}