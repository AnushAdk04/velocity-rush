import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../store/useGameStore'
import { DESERT_RUN_WAYPOINTS } from '../tracks/checkpoints'
import { NEON_CITY_WAYPOINTS } from '../tracks/NeonCityCheckpoints'
import { MOUNTAIN_WAYPOINTS } from '../tracks/MountainCheckpoints'
import { START_POSITION, START_ROTATION_Y } from '../tracks/checkpoints'
import { NEON_START_POSITION, NEON_START_ROTATION_Y } from '../tracks/NeonCityCheckpoints'
import { MOUNTAIN_START_POSITION, MOUNTAIN_START_ROTATION_Y } from '../tracks/MountainCheckpoints'

function getWaypoints() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') return NEON_CITY_WAYPOINTS
  if (track === 'mountain') return MOUNTAIN_WAYPOINTS
  return DESERT_RUN_WAYPOINTS
}

function getStartPosition() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') return NEON_START_POSITION
  if (track === 'mountain') return MOUNTAIN_START_POSITION
  return START_POSITION
}

function getStartRotationY() {
  const track = useGameStore.getState().currentTrack
  if (track === 'neon') return NEON_START_ROTATION_Y
  if (track === 'mountain') return MOUNTAIN_START_ROTATION_Y
  return START_ROTATION_Y
}

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

function getClosestWaypointIndex(pos: THREE.Vector3): number {
  const pts = getWaypoints()
  let minDist = Infinity
  let closest = 0
  for (let i = 0; i < pts.length; i++) {
    const d = new THREE.Vector3(pts[i].x, 0, pts[i].z)
      .distanceTo(new THREE.Vector3(pos.x, 0, pos.z))
    if (d < minDist) { minDist = d; closest = i }
  }
  return closest
}

function getTrackDirection(pos: THREE.Vector3): THREE.Vector3 {
  const pts = getWaypoints()
  const idx = getClosestWaypointIndex(pos)
  const next = (idx + 1) % pts.length
  return new THREE.Vector3()
    .subVectors(pts[next], pts[idx])
    .normalize()
}

function getTrackHeight(pos: THREE.Vector3): number {
  if (useGameStore.getState().currentTrack !== 'mountain') return 0

  const pts = getWaypoints()
  let minDist = Infinity
  let height = pts[0].y

  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(pts[i].x, 0, pts[i].z)
    const b = new THREE.Vector3(pts[i + 1].x, 0, pts[i + 1].z)
    const ab = new THREE.Vector3().subVectors(b, a)
    const len2 = ab.dot(ab)
    if (len2 === 0) continue
    const ap = new THREE.Vector3(pos.x, 0, pos.z).sub(a)
    const t = Math.max(0, Math.min(1, ap.dot(ab) / len2))
    const closest = a.clone().addScaledVector(ab, t)
    const distance = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(closest)
    if (distance < minDist) {
      minDist = distance
      height = THREE.MathUtils.lerp(pts[i].y, pts[i + 1].y, t)
    }
  }

  return height
}

function distToTrack(pos: THREE.Vector3): number {
  const pts = getWaypoints()
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

// Returns overshoot info instead of mutating directly, so caller can trigger shake
function getRoadPushback(
  car: THREE.Group,
  roadHalf: number
): { overshoot: number; toCenter: THREE.Vector3 } | null {
  const pts = getWaypoints()
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
    return { overshoot, toCenter }
  }
  return null
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
  onShake?: (intensity: number) => void
  onScreech?: (intensity: number) => void
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
    onShake,
    onScreech,
  } = options

  const velocity = useRef(new THREE.Vector3())
  const speed = useRef(0)
  const yVelocity = useRef(0)
  const currentGear = useRef(0)
  const gearChangeTimer = useRef(0)

  const currentAlert = useRef<CarAlert>('none')
  const alertHoldTimer = useRef(0)
  const warmupTimer = useRef(5.0)
  const ALERT_HOLD = 1.5

  const lastGoodPos = useRef(getStartPosition().clone())
  const lastGoodAngle = useRef(getStartRotationY())
  const trackedTrack = useRef(useGameStore.getState().currentTrack)
  const resetPressed = useRef(false)
  const goodPosTimer = useRef(0)

  const [, getKeys] = useKeyboardControls()

  useFrame((_, delta) => {
    const car = carRef.current
    if (!car) return
    const dt = Math.min(delta, 0.05)
    const keys = getKeys() as Record<string, boolean>
    const { phase } = useGameStore.getState()

    const currentTrack = useGameStore.getState().currentTrack
    if (currentTrack !== trackedTrack.current) {
      trackedTrack.current = currentTrack
      lastGoodPos.current.copy(getStartPosition())
      lastGoodAngle.current = getStartRotationY()
      warmupTimer.current = 5.0
    }

    if (phase === 'countdown' || phase === 'menu') {
      speed.current *= (1 - 3 * dt)
      onScreech?.(0)
      return
    }

    if (warmupTimer.current > 0) {
      warmupTimer.current -= dt
    }

    // --- R key reset ---
    const rDown = keys['reset'] ?? false
    if (rDown && !resetPressed.current) {
      resetPressed.current = true
      car.position.copy(lastGoodPos.current)
      car.position.y = getTrackHeight(car.position) + 0.4
      car.rotation.set(0, lastGoodAngle.current, 0)
      speed.current = 0
      velocity.current.set(0, 0, 0)
      yVelocity.current = 0
      warmupTimer.current = 2.0
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

    const groundY = getTrackHeight(car.position) + 0.4
    if (car.position.y < groundY) {
      car.position.y = groundY
      yVelocity.current = 0
    }

    // --- Road clamp (guard rail collision) ---
    const ROAD_HALF = 13
    const pushback = getRoadPushback(car, ROAD_HALF)
    if (pushback) {
      car.position.x += pushback.toCenter.x * pushback.overshoot
      car.position.z += pushback.toCenter.z * pushback.overshoot

      const impact = Math.min(pushback.overshoot / 2, 1)
      speed.current *= (1 - impact * 0.65)
      velocity.current.multiplyScalar(1 - impact * 0.65)

      const shakeIntensity = impact * Math.min(Math.abs(speed.current) / 20 + 0.3, 1)
      if (shakeIntensity > 0.05) onShake?.(shakeIntensity)
    }

    // --- Track awareness ---
    const dist = distToTrack(car.position)
    const trackDir = getTrackDirection(car.position)

    goodPosTimer.current -= dt
    if (dist < ROAD_HALF - 1 && goodPosTimer.current <= 0) {
      const carFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion)
      const dot = carFwd.dot(trackDir)
      if (dot > 0.2) {
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
      } else if (dot < -0.5 && isMoving) {
        newAlert = 'wrongway'
      }

      setAlert(newAlert)
    }

    // --- Tire screech — hard braking or sliding ---
    const carFwdNorm = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion)
    const velLen = velocity.current.length()
    const velDir = velLen > 0.01
      ? velocity.current.clone().normalize()
      : carFwdNorm.clone()
    const slideAngle = Math.abs(1 - carFwdNorm.dot(velDir))
    const isBraking = !!keys.brake && Math.abs(speed.current) > 8
    const screechIntensity = Math.max(
      isBraking ? Math.min(Math.abs(speed.current) / 30, 1) : 0,
      slideAngle * Math.min(Math.abs(speed.current) / 15, 1)
    )
    onScreech?.(screechIntensity)

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