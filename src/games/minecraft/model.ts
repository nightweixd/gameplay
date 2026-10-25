export const MATERIALS = [
  'grass',
  'dirt',
  'stone',
  'sand',
  'wood',
  'leaves',
  'bricks',
  'glass',
  'planks',
] as const
export const WORLD_MATERIALS = [...MATERIALS, 'birch'] as const
export type Material = (typeof WORLD_MATERIALS)[number]
export type Position = { x: number; y: number; z: number }
export type Direction = 'forward' | 'back' | 'left' | 'right' | 'up' | 'down'
export type Agent = Position & { facing: number }
export type Action =
  | { kind: 'move'; direction: Direction; count: number }
  | { kind: 'turn'; direction: 'left' | 'right' }
  | { kind: 'place'; direction: Direction; material: Material }
  | { kind: 'break'; direction: Direction }
  | { kind: 'teleport' }
  | { kind: 'repeat'; count: number; body: Action[] }
export type Step =
  | Exclude<Action, { kind: 'repeat' } | { kind: 'move' }>
  | { kind: 'move'; direction: Direction; count: 1 }
export const LIMIT = 24
export const MAX_BLOCKS = 40000
export const FLOOR = -8
export const keyOf = ({ x, y, z }: Position) => `${x},${y},${z}`
export const fromKey = (key: string): Position => {
  const [x, y, z] = key.split(',').map(Number)
  return { x, y, z }
}
export const inBounds = ({ x, y, z }: Position) =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  Number.isInteger(z) &&
  Math.abs(x) < LIMIT &&
  Math.abs(z) < LIMIT &&
  y >= FLOOR &&
  y <= 24

export class World {
  blocks = new Map<string, Material>()
  version = 0
  get(position: Position) {
    return this.blocks.get(keyOf(position))
  }
  place(position: Position, material: Material) {
    if (!inBounds(position) || this.get(position) || this.blocks.size >= MAX_BLOCKS) return false
    this.blocks.set(keyOf(position), material)
    this.version++
    return true
  }
  break(position: Position) {
    if (position.y <= FLOOR) return false // Keep a floor beneath the trial world.
    const changed = this.blocks.delete(keyOf(position))
    if (changed) this.version++
    return changed
  }
}

export function terrainHeight(x: number, z: number) {
  // Keep the central classroom level; form sharp, layered banks beyond it.
  if (Math.hypot(x, z) <= 10) return 0
  const distance = Math.hypot(x, z),
    blend = Math.min(1, (distance - 10) / 7)
  const hills = 3.5 + Math.sin(x * 0.22) * 1.6 + Math.cos(z * 0.19) * 1.6
  const bank = Math.floor(Math.max(0, hills * blend))
  const channel = Math.abs(x - (14 + Math.sin(z * 0.24) * 1.7))
  if (z > -19 && z < 7 && channel < 2.4) return channel < 1.4 ? -6 : -4
  return bank
}

export function createWorld(seed = 42) {
  const world = new World()
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let x = -LIMIT + 1; x < LIMIT; x++)
    for (let z = -LIMIT + 1; z < LIMIT; z++) {
      const height = terrainHeight(x, z)
      for (let y = FLOOR; y <= height; y++)
        world.place(
          { x, y, z },
          y === height && height >= 0 ? 'grass' : y >= height - 2 && height >= 0 ? 'dirt' : 'stone',
        )
    }
  // Plant after terrain generation so later columns cannot fill a tree canopy.
  const trees: [number, number][] = [
    [-8, -7],
    [10, -6],
    [-13, 2],
    [12, 9],
    [-5, -16],
    [7, -18],
    [18, -14],
    [-18, -12],
    [-17, 15],
    [18, 18],
  ]
  for (let i = 0; i < 95; i++) {
    const x = Math.floor(random() * 38) - 19,
      z = Math.floor(random() * 38) - 19
    if (Math.hypot(x, z) > 13 && trees.every(([tx, tz]) => Math.hypot(x - tx, z - tz) > 4.5))
      trees.push([x, z])
  }
  for (const [treeIndex, [x, z]] of trees.entries()) {
    const ground = terrainHeight(x, z),
      trunk = 5 + Math.floor(random() * 3)
    if (ground < 0) continue
    const birch = treeIndex % 3 === 0 || treeIndex === 1
    for (let y = 1; y <= trunk; y++) world.place({ x, y: ground + y, z }, birch ? 'birch' : 'wood')
    for (let level = 0; level < 5; level++) {
      const radius = level < 2 ? (birch ? 2 : 3) : level < 4 ? 2 : 1
      for (let dx = -radius; dx <= radius; dx++)
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius && Math.abs(dz) === radius && (level > 1 || random() < 0.45))
            continue
          world.place({ x: x + dx, y: ground + trunk - 1 + level, z: z + dz }, 'leaves')
        }
    }
  }
  return world
}

export function offset(position: Position, facing: number, direction: Direction): Position {
  if (direction === 'up' || direction === 'down')
    return { ...position, y: position.y + (direction === 'up' ? 1 : -1) }
  const turn = direction === 'back' ? 2 : direction === 'left' ? 3 : direction === 'right' ? 1 : 0
  const [dx, dz] = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ][(((facing + turn) % 4) + 4) % 4]
  return { ...position, x: position.x + dx, z: position.z + dz }
}

export function expandProgram(program: Action[], maxSteps = 600): Step[] {
  const result: Step[] = []
  let visits = 0
  function walk(actions: Action[], depth: number) {
    if (++visits > maxSteps * 10 + 100)
      throw new Error('This program has too many repeated loops. Use fewer repeats.')
    if (depth > 12) throw new Error('Too many nested repeat blocks.')
    for (const action of actions) {
      if (action.kind === 'repeat' || action.kind === 'move') {
        if (!Number.isInteger(action.count) || action.count < 1 || action.count > 100)
          throw new Error('Use a count from 1 to 100.')
        for (let i = 0; i < action.count; i++) {
          if (action.kind === 'repeat') walk(action.body, depth + 1)
          else result.push({ ...action, count: 1 })
          if (result.length > maxSteps)
            throw new Error(`This program is too long. Use at most ${maxSteps} agent steps.`)
        }
      } else result.push(action)
      if (result.length > maxSteps)
        throw new Error(`This program is too long. Use at most ${maxSteps} agent steps.`)
    }
  }
  walk(program, 0)
  return result
}

export function executeStep(
  world: World,
  agent: Agent,
  step: Step,
  player: Position,
): string | null {
  if (step.kind === 'turn') {
    agent.facing = (agent.facing + (step.direction === 'right' ? 1 : 3)) % 4
    return null
  }
  if (step.kind === 'teleport') {
    const origin = { x: Math.round(player.x), y: Math.round(player.y), z: Math.round(player.z) }
    for (const direction of ['forward', 'right', 'back', 'left', 'up'] as Direction[]) {
      const target = offset(origin, agent.facing, direction)
      if (inBounds(target) && !world.get(target)) {
        Object.assign(agent, target)
        return null
      }
    }
    return 'There is no space to bring the agent here.'
  }
  const target = offset(agent, agent.facing, step.direction)
  if (!inBounds(target)) return 'The agent reached the edge of the trial world.'
  if (step.kind === 'move') {
    if (world.get(target))
      return 'The agent is blocked. Break the block or choose another direction.'
    Object.assign(agent, target)
    return null
  }
  if (step.kind === 'place') {
    // Do not enclose the player in a block.
    if (
      Math.abs(target.x - player.x) < 0.8 &&
      Math.abs(target.z - player.z) < 0.8 &&
      target.y >= player.y - 1 &&
      target.y <= player.y + 1
    )
      return 'Move away before the agent builds here.'
    return world.place(target, step.material)
      ? null
      : 'There is already a block there, or the world is full.'
  }
  return world.break(target) ? null : 'There is no removable block in that direction.'
}

// Grid picking avoids raycasting thousands of individual block instances.
export function pickBlock(world: World, origin: Position, direction: Position, reach = 6) {
  let previous = { x: Math.round(origin.x), y: Math.round(origin.y), z: Math.round(origin.z) }
  for (let distance = 0; distance <= reach; distance += 0.04) {
    const current = {
      x: Math.round(origin.x + direction.x * distance),
      y: Math.round(origin.y + direction.y * distance),
      z: Math.round(origin.z + direction.z * distance),
    }
    if (world.get(current)) return { block: current, adjacent: previous }
    previous = current
  }
  return null
}

export function playerCollides(world: World, position: Position) {
  for (let x = Math.floor(position.x - 0.27 + 0.5); x <= Math.floor(position.x + 0.27 + 0.5); x++)
    for (let z = Math.floor(position.z - 0.27 + 0.5); z <= Math.floor(position.z + 0.27 + 0.5); z++)
      for (let y = Math.floor(position.y + 0.501); y <= Math.floor(position.y + 1.7 + 0.5); y++)
        if (world.get({ x, y, z })) return true
  return false
}
