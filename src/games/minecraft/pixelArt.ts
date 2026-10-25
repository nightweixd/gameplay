import type { Material } from './model'

type Face = 'top' | 'side'
const palettes: Record<Material, string[]> = {
  grass: ['#6b9340', '#739a46', '#638b38', '#7ba24d', '#698f3e'],
  dirt: ['#866044', '#a17a55', '#6c4e35', '#b08b65', '#79776b'],
  stone: ['#858580', '#96968f', '#757570', '#a3a29a', '#686965'],
  sand: ['#d9cd96', '#e2d6a3', '#c9bc87', '#ede1b2', '#cfc28e'],
  birch: ['#d6d6ca', '#e5e4d7', '#babdaf', '#f0ede0', '#aeb4a7'],
  wood: ['#6d5334', '#80633d', '#574129', '#91724a', '#a38756'],
  leaves: ['#315e22', '#4b812d', '#20451b', '#63953a', '#3b7026'],
  bricks: ['#a15442', '#b2654c', '#874937', '#bc745b', '#965140'],
  glass: ['#d5e8ed', '#e2f1f5', '#bfd9e1', '#f0f9fb', '#adcbd5'],
  planks: ['#b08b56', '#c29c66', '#9b7745', '#caa872', '#a6824d'],
}

// Original 16px art: grouped texels and material-specific motifs, not white noise.
export function blockArt(kind: Material, face: Face = 'side') {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 16
  const ctx = canvas.getContext('2d')!
  const palette = palettes[kind]
  let seed = [...(kind + face)].reduce((value, char) => value * 31 + char.charCodeAt(0), 37) >>> 0
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  ctx.fillStyle = palette[0]
  ctx.fillRect(0, 0, 16, 16)
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = palette[Math.floor(random() * 5)]
      ctx.fillRect(x, y, 1, 1)
    }
  if (kind === 'dirt') {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(random() * 15),
        y = Math.floor(random() * 15)
      ctx.fillStyle = '#a87e56'
      ctx.fillRect(x, y, 2, 1)
      ctx.fillStyle = '#614932'
      ctx.fillRect(x, y + 1, 1, 1)
    }
  }
  if (kind === 'stone') {
    for (let i = 0; i < 9; i++) {
      const x = Math.floor(random() * 13),
        y = Math.floor(random() * 15)
      ctx.fillStyle = '#676862'
      ctx.fillRect(x, y, 3, 1)
      ctx.fillStyle = '#a5a59d'
      ctx.fillRect(x + 1, y + 1, 2, 1)
    }
  }
  if (kind === 'grass' && face === 'side') {
    ctx.drawImage(blockArt('dirt'), 0, 0)
    for (let x = 0; x < 16; x++) {
      const depth = 2 + [1, 0, 2, 0, 1, 2, 1, 0][x % 8]
      ctx.fillStyle = palettes.grass[x % 5]
      ctx.fillRect(x, 0, 1, depth)
      ctx.fillStyle = '#47682b'
      ctx.fillRect(x, depth, 1, 1)
    }
  }
  if (kind === 'wood' || kind === 'birch') {
    if (face === 'top') {
      ctx.fillStyle = kind === 'birch' ? '#d7c59e' : '#b19563'
      ctx.fillRect(0, 0, 16, 16)
      for (let inset = 1; inset < 8; inset += 2) {
        ctx.strokeStyle = inset % 4 === 1 ? '#79603b' : '#947648'
        ctx.strokeRect(inset + 0.5, inset + 0.5, 15 - inset * 2, 15 - inset * 2)
      }
      ctx.fillStyle = '#665031'
      ctx.fillRect(7, 6, 2, 3)
    } else if (kind === 'birch') {
      for (const [x, y, width] of [
        [0, 2, 3],
        [9, 1, 4],
        [5, 5, 2],
        [13, 8, 3],
        [1, 10, 4],
        [7, 12, 3],
        [11, 15, 2],
      ]) {
        ctx.fillStyle = '#343a31'
        ctx.fillRect(x, y, width, 1)
        ctx.fillStyle = '#667064'
        ctx.fillRect(x + 1, y + 1, Math.max(1, width - 1), 1)
      }
    } else {
      for (let x = 0; x < 16; x += 3) {
        ctx.fillStyle = '#493821'
        ctx.fillRect(x, x % 5, 1, 9)
        ctx.fillRect((x + 1) % 16, 9 + (x % 3), 1, 5)
        ctx.fillStyle = '#a18654'
        ctx.fillRect(x + 1, 1 + (x % 5), 1, 5)
      }
      ctx.fillStyle = '#44321f'
      ctx.fillRect(6, 7, 2, 3)
      ctx.fillStyle = '#9e8050'
      ctx.fillRect(7, 8, 1, 1)
    }
  }
  if (kind === 'planks') {
    for (let y = 3; y < 16; y += 4) {
      ctx.fillStyle = '#705332'
      ctx.fillRect(0, y, 16, 1)
      ctx.fillStyle = '#d1ae78'
      ctx.fillRect(0, y + 1, 16, 1)
      ctx.fillStyle = '#816137'
      ctx.fillRect(y % 8 === 3 ? 5 : 12, y - 3, 1, 3)
    }
  }
  if (kind === 'bricks') {
    for (let y = 3; y < 16; y += 4) {
      ctx.fillStyle = '#c4b7a3'
      ctx.fillRect(0, y, 16, 1)
      for (let x = y % 8 === 3 ? 4 : 0; x < 16; x += 8) ctx.fillRect(x, y - 3, 1, 3)
      ctx.fillStyle = '#d28768'
      ctx.fillRect(0, y - 3, 16, 1)
    }
  }
  if (kind === 'leaves') {
    ctx.fillStyle = '#244b1c'
    ctx.fillRect(0, 0, 16, 16)
    for (let i = 0; i < 34; i++) {
      const x = Math.floor(random() * 16),
        y = Math.floor(random() * 16)
      ctx.fillStyle = palettes.leaves[1 + (i % 4)]
      ctx.fillRect(x, y, 3, 2)
      ctx.fillStyle = i % 3 === 0 ? '#709e45' : '#376524'
      ctx.fillRect(x + 1, y - 1, 2, 1)
      ctx.fillStyle = '#193e17'
      ctx.fillRect(x, y + 2, 2, 1)
    }
    for (let i = 0; i < 17; i++)
      ctx.clearRect(Math.floor(random() * 16), Math.floor(random() * 16), 1 + (i % 2), 1)
  }
  if (kind === 'glass') {
    ctx.clearRect(0, 0, 16, 16)
    ctx.strokeStyle = '#b5d5e0'
    ctx.strokeRect(0.5, 0.5, 15, 15)
    ctx.fillStyle = '#e4f6fb'
    ctx.fillRect(1, 1, 14, 1)
    ctx.fillRect(1, 1, 1, 14)
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(3 + i, 7 - i, 1, 1)
      ctx.fillRect(8 + i, 13 - i, 1, 1)
    }
  }
  return canvas
}
