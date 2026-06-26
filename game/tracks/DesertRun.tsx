'use client'

export default function DesertRun() {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#d4a853" />
      </mesh>

      {/* Road strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -100]}>
        <planeGeometry args={[18, 300]} />
        <meshStandardMaterial color="#c2a96e" />
      </mesh>
    </>
  )
}