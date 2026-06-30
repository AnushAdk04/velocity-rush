'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ChaseCameraProps {
  target: React.RefObject<THREE.Group>
  speed?: React.RefObject<number>
  shakeRef?: React.RefObject<number>  // 0-1 shake intensity
}

export default function ChaseCamera({ target, speed, shakeRef }: ChaseCameraProps) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())
  const shakeDecay = useRef(0)

  useFrame((_, delta) => {
    const car = target.current
    if (!car) return

    const spd = Math.abs(speed?.current ?? 0)
    const topSpeed = 55
    const zoomFactor = 1 + (spd / topSpeed) * 0.1

    const offset = new THREE.Vector3(0, 3.2 * zoomFactor, 8 * zoomFactor)
    const desiredPos = offset.applyQuaternion(car.quaternion).add(car.position)
    currentPos.current.lerp(desiredPos, 0.12)

    const lookAtOffset = new THREE.Vector3(0, 0.8, -5)
      .applyQuaternion(car.quaternion)
      .add(car.position)
    currentLookAt.current.lerp(lookAtOffset, 0.15)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)

    // --- Camera shake ---
    // Accept external shake trigger OR use shakeDecay
    const externalShake = shakeRef?.current ?? 0
    if (externalShake > shakeDecay.current) {
      shakeDecay.current = externalShake
    }

    if (shakeDecay.current > 0.01) {
      const s = shakeDecay.current
      camera.position.x += (Math.random() - 0.5) * s * 0.4
      camera.position.y += (Math.random() - 0.5) * s * 0.2
      shakeDecay.current = Math.max(0, shakeDecay.current - delta * 3)
    }
  })

  return null
}