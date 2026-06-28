import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { DESERT_RUN_WAYPOINTS } from '../tracks/checkpoints'
import { useGameStore } from '../../store/useGameStore'

const GEARS = [
  { min: 0, max: 8, accelMult: 1.0 },
  { min: 8, max: 16, accelMult: 0.85 },
  { min: 16, max: 24, accelMult: 0.70 },
  { min: 24, max: 32, accelMult: 0.55 },
  { min: 32, max: 40, accelMult: 0.40 },
  { min: 40, max: 55, accelMult: 0.28 },
]

function getGear(speed: number): number {
  const s = Math.abs(speed)
  for (let i = 0; i < GEARS.length; i++) {
    if (s >= GEARS[i].min && s < GEARS[i].max) return i
  }
  return GEARS.length - 1
}

// Find closest waypoint index to a position
function getClosestWaypointIndex(pos: THREE.Vector3): number {
  const pts = DESERT_RUN_WAYPOINTS
  let minDist = Infinity
  let closest = 0
  for (let i = 0; i < pts.length; i++) {
    const d = new THREE.Vector3(pts[i].x, 0, pts[i].z)
      .distanceTo(new THREE.Vector3(pos.x, 0, pos.z))
    if (d < minDist) { minDist = d; closest = i }
  }
  return closest
}

// Get track forward direction at closest waypoint
function getTrackDirection(pos: THREE.Vector3): THREE.Vector3 {
  const pts = DESERT_RUN_WAYPOINTS
  const idx = getClosestWaypointIndex(pos)
  const next = (idx + 1) % pts.length
  return new THREE.Vector3()
    .subVectors(pts[next], pts[idx])
    .normalize()
}

// Distance from point to nearest track centerline segment
function distToTrack(pos: THREE.Vector3): number {
  const pts = DESERT_RUN_WAYPOINTS
  let minDist = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(pts[i].x, 0, pts[i].z)
    const b = new THREE.Vector3(pts[i + 1].x, 0, pts[i + 1].z)
    const ab = new THREE.Vector3().subVectors(b, a)
    const len2 = ab.dot(ab)
    if (len2 === 0) continue
    const ap = new THREE.Vector3()
      .subVectors(new THREE.Vector3(pos.x, 0, pos.z), a)
    const t = Math.max(0, Math.min(1, ap.dot(ab) / len2))
    const closest = a.clone().addScaledVector(ab, t)
    const d = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(closest)
    if (d < minDist) minDist = d
  }
  return minDist
}

// Push car back inside road if it goes past edge
function clampToRoad(
  car: THREE.Group,
  speed: { current: number },
  velocity: { current: THREE.Vector3 },
  roadHalf: number
) {
  const pts = DESERT_RUN_WAYPOINTS
  let minDist = Infinity
  let closestPt = new THREE.Vector3()

  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(pts[i].x, 0, pts[i].z)
    const b = new THREE.Vector3(pts[i + 1].x, 0, pts[i + 1].z)
    const ab = new THREE.Vector3().subVectors(b, a)
    const len2 = ab.dot(ab)
    if (len2 === 0) continue
    const ap = new THREE.Vector3()
      .subVectors(new THREE.Vector3(car.position.x, 0, car.position.z), a)
    const t = Math.max(0, Math.min(1, ap.dot(ab) / len2))
    const pt = a.clone().addScaledVector(ab, t)
    const d = new THREE.Vector3(car.position.x, 0, car.position.z).distanceTo(pt)
    if (d < minDist) { minDist = d; closestPt = pt }
  }

  if (minDist > roadHalf) {
    const overshoot = minDist - roadHalf
    const toCenter = new THREE.Vector3(
      closestPt.x - car.position.x,
      0,
      closestPt.z - car.position.z
    ).normalize()
    car.position.x += toCenter.x * overshoot
    car.position.z += toCenter.z * overshoot

    // Kill speed on impact — harder hit = more penalty
    const impact = Math.min(overshoot / 2, 1)
    speed.current *= (1 - impact * 0.65)
    velocity.current.multiplyScalar(1 - impact * 0.65)
  }
}

export type CarAlert = 'none' | 'wrongway' | 'offtrack'

interface CarPhysicsOptions {
  topSpeed?: number
  acceleration?: number
  braking?: number
  handling?: number
  grip?: number
  gravity?: number
  onAlert?: (alert: CarAlert) => void
}

export function useCarPhysics(
  carRef: React.RefObject<THREE.Group>,
  options: CarPhysicsOptions = {}
) {
  const {
    topSpeed = 55,
    acceleration = 12,
    braking = 28,
    handling = 1.4,
    grip = 0.88,
    gravity = 20,
    onAlert,
  } = options

  const velocity = useRef(new THREE.Vector3())
  const speed = useRef(0)
  const yVelocity = useRef(0)
  const currentGear = useRef(0)
  const gearChangeTimer = useRef(0)

  // Alert state
  const currentAlert = useRef<CarAlert>('none')
  const alertHoldTimer = useRef(0)    // how long current alert has been active
  const warmupTimer = useRef(5.0)     // ignore alerts for 3s after spawn
  const ALERT_HOLD = 1.5              // keep alert showing for 1.5s minimum

  // Reset / checkpoint tracking
  const lastGoodPos = useRef(new THREE.Vector3(0, 0.4, 50))
  const lastGoodAngle = useRef(Math.PI)
  const resetPressed = useRef(false)
  const goodPosTimer = useRef(0)      // update good pos every 0.5s

  const [, getKeys] = useKeyboardControls()

  useFrame((_, delta) => {
    const car = carRef.current
    if (!car) return
    const dt = Math.min(delta, 0.05)
    const keys = getKeys() as Record<string, boolean>
    const { phase } = useGameStore.getState()

    if (phase === 'countdown' || phase === 'menu') {
      speed.current *= (1 - 3 * dt)
      return
    }

    // Warmup — no alerts right after spawn
    if (warmupTimer.current > 0) {
      warmupTimer.current -= dt
    }

    // --- R key reset ---
    const rDown = keys['reset'] ?? false
    if (rDown && !resetPressed.current) {
      resetPressed.current = true
      car.position.copy(lastGoodPos.current)
      car.position.y = 0.4
      car.rotation.set(0, lastGoodAngle.current, 0)
      speed.current = 0
      velocity.current.set(0, 0, 0)
      yVelocity.current = 0
      warmupTimer.current = 2.0  // grace period after reset too
      setAlert('none')
    }
    if (!rDown) resetPressed.current = false

    // --- Gear ---
    const gear = getGear(Math.abs(speed.current))
    gearChangeTimer.current -= dt
    if (gear !== currentGear.current && gearChangeTimer.current <= 0) {
      currentGear.current = gear
      gearChangeTimer.current = 0.3
    }
    const gearMult = GEARS[currentGear.current].accelMult

    // --- Engine ---
    if (keys.forward) {
      speed.current = Math.min(
        speed.current + acceleration * gearMult * dt, topSpeed
      )
    } else if (keys.backward) {
      if (speed.current > 0.5) {
        speed.current = Math.max(speed.current - braking * dt, 0)
      } else {
        speed.current = Math.max(
          speed.current - (acceleration * 0.5) * dt, -topSpeed * 0.35
        )
      }
    } else {
      speed.current *= (1 - 1.8 * dt)
      if (Math.abs(speed.current) < 0.05) speed.current = 0
    }
    if (keys.brake) speed.current *= (1 - 10 * dt)

    // --- Steering ---
    const speedRatio = Math.min(Math.abs(speed.current) / topSpeed, 1)
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

    yVelocity.current -= gravity * dt
    if (car.position.y - 0.4 <= 0) {
      car.position.y = 0.4
      yVelocity.current = 0
    }

    car.position.x += velocity.current.x * dt
    car.position.z += velocity.current.z * dt
    car.position.y += yVelocity.current * dt

    // --- Road clamp (guard rail collision) ---
    const ROAD_HALF = 13
    clampToRoad(car, speed, velocity, ROAD_HALF)

    // --- Track awareness ---
    const dist = distToTrack(car.position)
    const trackDir = getTrackDirection(car.position)

    // Update last good position only when on track and moving forward
    goodPosTimer.current -= dt
    if (dist < ROAD_HALF - 1 && goodPosTimer.current <= 0) {
      const carFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion)
      const dot = carFwd.dot(trackDir)
      if (dot > 0.2) {  // only save if going roughly correct direction
        lastGoodPos.current.copy(car.position)
        lastGoodAngle.current = car.rotation.y
        goodPosTimer.current = 0.5
      }
    }

    // --- Alert detection (skip during warmup) ---
    if (warmupTimer.current <= 0) {
      const carFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion)
      const dot = carFwd.dot(trackDir)
      const isMoving = Math.abs(speed.current) > 8

      let newAlert: CarAlert = 'none'

      if (dist > ROAD_HALF + 1) {
        newAlert = 'offtrack'
      } else if (dot < -0.5 && Math.abs(speed.current) > 8) {
        newAlert = 'wrongway'
      }

      setAlert(newAlert)
    }

    function setAlert(a: CarAlert) {
      if (a !== 'none') {
        alertHoldTimer.current = ALERT_HOLD
        if (currentAlert.current !== a) {
          currentAlert.current = a
          onAlert?.(a)
        }
      } else {
        alertHoldTimer.current -= dt
        if (alertHoldTimer.current <= 0 && currentAlert.current !== 'none') {
          currentAlert.current = 'none'
          onAlert?.('none')
        }
      }
    }
  })

  return { velocity, speed, currentGear }
}