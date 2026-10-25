import { useEffect, useRef } from 'react'
import type { Material } from './model'
import { blockArt } from './pixelArt'

export default function BlockIcon({ material }: { material: Material }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 36, 40)
    ctx.imageSmoothingEnabled = false
    const top = blockArt(material, 'top'),
      side = blockArt(material)
    const face = (
      image: HTMLCanvasElement,
      matrix: [number, number, number, number, number, number],
      shade: number,
    ) => {
      ctx.save()
      ctx.setTransform(...matrix)
      ctx.drawImage(image, 0, 0)
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = `rgba(0,0,0,${shade})`
      ctx.fillRect(0, 0, 16, 16)
      ctx.restore()
    }
    face(top, [1, 0.5625, -1, 0.5625, 18, 1], 0)
    face(side, [1, 0.5625, 0, 1.125, 2, 10], 0.12)
    face(side, [1, -0.5625, 0, 1.125, 18, 19], 0.28)
  }, [material])
  return (
    <canvas
      ref={canvas}
      width={36}
      height={40}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
