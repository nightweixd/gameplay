import * as THREE from 'three'
import type { Material } from './model'
import { blockArt } from './pixelArt'

export function blockTexture(kind: Material, face: 'top' | 'side' = 'side') {
  const texture = new THREE.CanvasTexture(blockArt(kind, face))
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestMipmapLinearFilter; texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function plantTexture(flower = false) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 16
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#507b30'
  ctx.fillRect(7, 7, 2, 9); ctx.fillRect(4, 10, 3, 2); ctx.fillRect(9, 12, 3, 2)
  if (flower) {
    ctx.fillStyle = '#d94a37'; ctx.fillRect(5, 3, 6, 5); ctx.fillRect(4, 4, 8, 3)
    ctx.fillStyle = '#f3764c'; ctx.fillRect(6, 3, 3, 2)
    ctx.fillStyle = '#f3ce55'; ctx.fillRect(7, 5, 2, 2)
  } else {
    ctx.fillStyle = '#71974a'
    for (let x = 2; x < 15; x += 3) { const top = 3 + x % 4; ctx.fillRect(x, top, 1, 16 - top); ctx.fillRect(x + 1, top + 3, 1, 6) }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestMipmapLinearFilter; texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function skinTexture(kind: 'metal' | 'joint' | 'skin' | 'sleeve') {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 16
  const ctx = canvas.getContext('2d')!
  const colors = kind === 'metal' ? ['#c9c1a9', '#dcd4bc', '#a69d86', '#797b71'] : kind === 'joint' ? ['#6e7068', '#818479', '#555b54', '#41483f'] : kind === 'skin' ? ['#b78562', '#c59570', '#a37454', '#916648'] : ['#269194', '#38a4a7', '#217c80', '#1b6e74']
  ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, 16, 16)
  for (let y = 0; y < 16; y += 3) for (let x = 0; x < 16; x += 3) { ctx.fillStyle = colors[(x * 7 + y * 11) % 3]; ctx.fillRect(x, y, 2, 2) }
  if (kind === 'metal' || kind === 'joint') {
    ctx.fillStyle = colors[1]; ctx.fillRect(1, 1, 14, 1); ctx.fillRect(1, 1, 1, 14)
    ctx.fillStyle = colors[2]; ctx.fillRect(1, 14, 14, 1); ctx.fillRect(14, 1, 1, 14)
    ctx.fillStyle = colors[3]; for (const [x, y] of [[2, 2], [12, 2], [2, 12], [12, 12]]) ctx.fillRect(x, y, 2, 2)
  }
  const texture = new THREE.CanvasTexture(canvas); texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestMipmapLinearFilter; texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
