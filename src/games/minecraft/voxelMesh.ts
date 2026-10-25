import * as THREE from 'three'
import { fromKey, WORLD_MATERIALS as MATERIALS, type Position, type World } from './model'
import type { Skylight } from './skylight'

const faceShade = [0.6, 0.6, 1, 0.5, 0.8, 0.8]
const normals: Position[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
]
const axes = ['x', 'y', 'z'] as const

export function shadeCube(geometry: THREE.BoxGeometry) {
  const colors = new Float32Array(24 * 3)
  for (let vertex = 0; vertex < 24; vertex++)
    colors.fill(Math.pow(faceShade[Math.floor(vertex / 4)], 2.2), vertex * 3, vertex * 3 + 3)
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

// Render exposed faces only, with voxel corner occlusion like a block game.
export function meshWorld(world: World, cube: THREE.BoxGeometry, light: Skylight) {
  const positions = MATERIALS.map(() => [] as number[]),
    normalsOut = MATERIALS.map(() => [] as number[])
  const uvs = MATERIALS.map(() => [] as number[]),
    colors = MATERIALS.map(() => [] as number[])
  const indices = MATERIALS.map(() => [] as number[])
  const groups = MATERIALS.map(
    () => [] as { start: number; count: number; materialIndex: number }[],
  )
  const vertices = cube.getAttribute('position'),
    textureUV = cube.getAttribute('uv')
  const occludes = (p: Position) => {
    const type = world.get(p)
    return !!type && type !== 'glass' && type !== 'leaves'
  }
  for (const [key, material] of world.blocks) {
    const p = fromKey(key),
      index = MATERIALS.indexOf(material)
    for (let face = 0; face < 6; face++) {
      const n = normals[face],
        neighbor = { x: p.x + n.x, y: p.y + n.y, z: p.z + n.z }
      const adjacent = world.get(neighbor)
      if (adjacent && (adjacent === material || occludes(neighbor))) continue
      const start = positions[index].length / 3,
        tangents = axes.filter((axis) => n[axis] === 0)
      const cornerShades: number[] = []
      for (let corner = 0; corner < 4; corner++) {
        const vertex = face * 4 + corner
        const local = {
          x: vertices.getX(vertex),
          y: vertices.getY(vertex),
          z: vertices.getZ(vertex),
        }
        const sideA = { ...neighbor },
          sideB = { ...neighbor },
          diagonal = { ...neighbor }
        sideA[tangents[0]] += Math.sign(local[tangents[0]])
        sideB[tangents[1]] += Math.sign(local[tangents[1]])
        diagonal[tangents[0]] = sideA[tangents[0]]
        diagonal[tangents[1]] = sideB[tangents[1]]
        const a = Number(occludes(sideA)),
          b = Number(occludes(sideB))
        const darkness = a && b ? 3 : a + b + Number(occludes(diagonal))
        const samples = [neighbor, sideA, sideB, diagonal].filter((cell) => !occludes(cell))
        const daylight =
          samples.reduce((sum, cell) => sum + light.brightness(cell), 0) / samples.length
        const shade = faceShade[face] * [1, 0.85, 0.7, 0.55][darkness] * daylight
        cornerShades.push(shade)
        // Convert display brightness to the renderer's linear color space.
        const linearShade = Math.pow(shade, 2.2)
        positions[index].push(p.x + local.x, p.y + local.y, p.z + local.z)
        normalsOut[index].push(n.x, n.y, n.z)
        uvs[index].push(textureUV.getX(vertex), textureUV.getY(vertex))
        colors[index].push(linearShade, linearShade, linearShade)
      }
      groups[index].push({
        start: indices[index].length,
        count: 6,
        materialIndex:
          material === 'grass' || material === 'wood' || material === 'birch' ? face : 0,
      })
      // Pick the quad diagonal from corner light to avoid triangular AO seams.
      if (cornerShades[0] + cornerShades[3] > cornerShades[1] + cornerShades[2])
        indices[index].push(start, start + 3, start + 1, start, start + 2, start + 3)
      else indices[index].push(start, start + 2, start + 1, start + 2, start + 3, start + 1)
    }
  }
  return MATERIALS.map((_, index) => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions[index], 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalsOut[index], 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs[index], 2))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors[index], 3))
    // Group by face material to keep draw calls bounded rather than one per block.
    const grouped = Array.from({ length: 6 }, () => [] as number[])
    for (const group of groups[index])
      grouped[group.materialIndex].push(
        ...indices[index].slice(group.start, group.start + group.count),
      )
    const sorted: number[] = []
    for (let face = 0; face < 6; face++)
      if (grouped[face].length) {
        geometry.addGroup(sorted.length, grouped[face].length, face)
        for (const vertex of grouped[face]) sorted.push(vertex)
      }
    geometry.setIndex(sorted)
    geometry.computeBoundingSphere()
    return geometry
  })
}
