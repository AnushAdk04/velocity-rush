'use client'

import dynamic from 'next/dynamic'

const GameScene = dynamic(() => import('../game/GameScene'), { ssr: false })

export default function Home() {
  return <GameScene />
}