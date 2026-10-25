import { fromKey, LIMIT, FLOOR, type Position, type World } from './model'

const SIDE = LIMIT * 2 + 1,
  PLANE = SIDE * SIDE,
  HEIGHT = 26 - FLOOR
const indexOf = ({ x, y, z }: Position) => (y - FLOOR) * PLANE + (z + LIMIT) * SIDE + x + LIMIT

// Direct daylight plus attenuated light spreading sideways into covered spaces.
// Rebuilt on block edits, not on camera movement or every animation frame.
export function buildSkylight(world: World) {
  const size = PLANE * HEIGHT,
    opacity = new Uint8Array(size),
    levels = new Uint8Array(size)
  for (const [key, material] of world.blocks)
    opacity[indexOf(fromKey(key))] = material === 'glass' ? 0 : material === 'leaves' ? 1 : 255
  const queue = new Uint32Array(size * 16)
  let head = 0,
    tail = 0
  for (let column = 0; column < PLANE; column++) {
    let light = 15
    for (let y = HEIGHT - 1; y >= 0; y--) {
      const index = y * PLANE + column
      light = opacity[index] === 255 ? 0 : Math.max(0, light - opacity[index])
      levels[index] = light
      if (light > 1) queue[tail++] = index
    }
  }
  const visit = (source: number, target: number) => {
    if (opacity[target] === 255) return
    const level = levels[source] - 1 - opacity[target]
    if (level <= levels[target]) return
    levels[target] = level
    if (level > 1) queue[tail++] = target
  }
  while (head < tail) {
    const index = queue[head++],
      x = index % SIDE,
      z = Math.floor(index / SIDE) % SIDE,
      y = Math.floor(index / PLANE)
    if (x > 0) visit(index, index - 1)
    if (x < SIDE - 1) visit(index, index + 1)
    if (z > 0) visit(index, index - SIDE)
    if (z < SIDE - 1) visit(index, index + SIDE)
    if (y > 0) visit(index, index - PLANE)
    if (y < HEIGHT - 1) visit(index, index + PLANE)
  }
  return {
    brightness(position: Position) {
      const p = { x: Math.round(position.x), y: Math.round(position.y), z: Math.round(position.z) }
      if (Math.abs(p.x) > LIMIT || Math.abs(p.z) > LIMIT || p.y < FLOOR || p.y > 25) return 1
      return Math.max(0.18, Math.pow(0.9, 15 - levels[indexOf(p)]))
    },
  }
}

export type Skylight = ReturnType<typeof buildSkylight>
