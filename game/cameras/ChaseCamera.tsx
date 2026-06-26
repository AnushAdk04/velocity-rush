'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ChaseCameraProps {
  target: React.RefObject<THREE.Group>
  speed?: React.RefObject<number>
}

export default function ChaseCamera({ target, speed }: ChaseCameraProps) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())

  useFrame(() => {
    const car = target.current
    if (!car) return

    const spd = speed?.current ?? 0
    // Zoom out slightly at high speed
    const zoomFactor = 1 + (Math.abs(spd) / 40) * 0.4

    // Desired camera offset behind and above the car
    const offset = new THREE.Vector3(0, 3.5 * zoomFactor, 9 * zoomFactor)

    // Transform offset to car's local space
    const desiredPos = offset
      .applyQuaternion(car.quaternion)
      .add(car.position)

    // Smooth camera position — lower value = more lag (cinematic)
    currentPos.current.lerp(desiredPos, 0.08)

    // Look slightly ahead of the car
    const lookAtOffset = new THREE.Vector3(0, 0.5, -4)
      .applyQuaternion(car.quaternion)
      .add(car.position)

    currentLookAt.current.lerp(lookAtOffset, 0.12)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)
  })

  return null
}