import * as THREE from 'three'
import { LIMIT, terrainHeight, type World } from './model'
import { plantTexture } from './textures'
import type { Skylight } from './skylight'

export function addScenery(
  scene: THREE.Scene,
  geometry: THREE.BoxGeometry,
  grass: THREE.Material[],
  bark: THREE.Material[],
  leaves: THREE.Material,
  world: World,
  birch: THREE.Material[],
) {
  const transform = new THREE.Object3D()
  const landscape = new THREE.InstancedMesh(geometry, grass, 36000)
  const trunks = new THREE.InstancedMesh(geometry, bark, 1000)
  const birches = new THREE.InstancedMesh(geometry, birch, 1000)
  let birchCount = 0
  const canopies = new THREE.InstancedMesh(geometry, leaves, 12000)
  let groundCount = 0,
    trunkCount = 0,
    leafCount = 0
  const put = (mesh: THREE.InstancedMesh, count: number, x: number, y: number, z: number) => {
    transform.position.set(x, y, z)
    transform.rotation.set(0, 0, 0)
    transform.scale.set(1, 1, 1)
    transform.updateMatrix()
    mesh.setMatrixAt(count, transform.matrix)
  }
  // Decorative continuation beyond the playable clearing keeps the horizon natural.
  for (let x = -64; x <= 64; x++)
    for (let z = -64; z <= 64; z++) {
      if (Math.abs(x) < LIMIT && Math.abs(z) < LIMIT) continue
      const height = terrainHeight(x, z)
      const lowest = Math.min(
        height,
        terrainHeight(x - 1, z),
        terrainHeight(x + 1, z),
        terrainHeight(x, z - 1),
        terrainHeight(x, z + 1),
      )
      for (let y = lowest; y <= height; y++) put(landscape, groundCount++, x, y, z)
      if (Math.abs(x) < 57 && Math.abs(z) < 57 && (x + 70) % 9 === 0 && (z + 72) % 11 === 0) {
        const isBirch = Math.abs(x + z) % 3 === 0
        for (let y = 1; y <= 5; y++) {
          if (isBirch) put(birches, birchCount++, x, height + y, z)
          else put(trunks, trunkCount++, x, height + y, z)
        }
        for (let dx = -2; dx <= 2; dx++)
          for (let dz = -2; dz <= 2; dz++)
            for (let dy = 0; dy < 3; dy++) {
              if (Math.abs(dx) + Math.abs(dz) > (dy === 2 ? 2 : 3)) continue
              put(canopies, leafCount++, x + dx, height + 4 + dy, z + dz)
            }
      }
    }
  landscape.count = groundCount
  trunks.count = trunkCount
  canopies.count = leafCount
  birches.count = birchCount
  for (const mesh of [landscape, trunks, birches, canopies]) {
    mesh.computeBoundingSphere()
    scene.add(mesh)
  }

  const plantGeometry = new THREE.PlaneGeometry(0.85, 0.85)
  const plantTextures = [plantTexture(), plantTexture(true)]
  const plantMaterials = plantTextures.map(
    (map) => new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide }),
  )
  const plants = plantMaterials.map(
    (material) => new THREE.InstancedMesh(plantGeometry, material, 900),
  )
  const positions: { x: number; y: number; z: number; flower: number }[] = []
  const counts = [0, 0]
  for (let x = -21; x <= 21; x++)
    for (let z = -21; z <= 21; z++) {
      const hash = (Math.imul(x + 43, 374761393) ^ Math.imul(z + 37, 668265263)) >>> 0
      if (hash % 11 !== 0 || (Math.abs(x) < 6 && z > -5 && z < 12)) continue
      const y = terrainHeight(x, z)
      if (y < 0 || world.get({ x, y: y + 1, z })) continue
      const flower = hash % 7 === 0 ? 1 : 0
      positions.push({ x, y: y + 0.93, z, flower })
      for (let side = 0; side < 2; side++) {
        transform.position.set(x, y + 0.93, z)
        transform.rotation.set(0, Math.PI / 4 + (side * Math.PI) / 2, 0)
        transform.updateMatrix()
        plants[flower].setMatrixAt(counts[flower]++, transform.matrix)
      }
    }
  for (let i = 0; i < 2; i++) {
    plants[i].count = counts[i]
    plants[i].computeBoundingSphere()
    scene.add(plants[i])
  }
  let lastVersion = -1
  const tint = new THREE.Color()
  return {
    update(light: Skylight) {
      if (lastVersion === world.version) return
      lastVersion = world.version
      const visible = [0, 0]
      for (const p of positions) {
        // A placed block or a dug-out grass block removes its decorative plant.
        if (
          world.get({ x: p.x, y: Math.round(p.y - 0.93), z: p.z }) !== 'grass' ||
          world.get({ x: p.x, y: Math.round(p.y - 0.93) + 1, z: p.z })
        )
          continue
        for (let side = 0; side < 2; side++) {
          transform.position.set(p.x, p.y, p.z)
          transform.rotation.set(0, Math.PI / 4 + (side * Math.PI) / 2, 0)
          transform.updateMatrix()
          const index = visible[p.flower]++,
            shade = Math.pow(light.brightness(p), 2.2)
          plants[p.flower].setMatrixAt(index, transform.matrix)
          plants[p.flower].setColorAt(index, tint.setRGB(shade, shade, shade))
        }
      }
      for (let i = 0; i < 2; i++) {
        const plant = plants[i]
        plant.count = visible[i]
        plant.instanceMatrix.needsUpdate = true
        if (plant.instanceColor) plant.instanceColor.needsUpdate = true
      }
    },
    dispose() {
      ;[landscape, trunks, birches, canopies, ...plants].forEach((mesh) => mesh.dispose())
      plantGeometry.dispose()
      plantMaterials.forEach((material) => material.dispose())
      plantTextures.forEach((texture) => texture.dispose())
    },
  }
}
