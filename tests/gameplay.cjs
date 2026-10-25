// Run the real TypeScript world engine and Blockly definitions in Node.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  )
const {
  agentRotationY,
  createWorld,
  expandProgram,
  executeStep,
  offset,
  pickBlock,
  playerCollides,
  MAX_BLOCKS,
  FLOOR,
} = require('../src/games/minecraft/model.ts')
const Blockly = require('blockly/core')
const { defineBlocks, readProgram, STARTER_WORKSPACE } = require('../src/games/minecraft/blocks.ts')
defineBlocks()
const workspace = new Blockly.Workspace()
Blockly.serialization.workspaces.load(STARTER_WORKSPACE, workspace)
const program = readProgram(workspace)
const steps = expandProgram(program)
assert.equal(steps.length, 8, 'actual Blockly starter must generate eight steps')
const world = createWorld(42),
  agent = { x: 3, y: 1, z: 0, facing: 0 },
  player = { x: 0, y: 1, z: 7 }
for (const step of steps) assert.equal(executeStep(world, agent, step, player), null)
for (let y = 1; y <= 4; y++)
  assert.equal(
    world.get({ x: 3, y, z: -1 }),
    'wood',
    'starter agent must construct a four-block tower',
  )
assert.equal(agent.y, 5)
const snapshot = Blockly.serialization.workspaces.save(workspace)
workspace.dispose()
const reopened = new Blockly.Workspace()
Blockly.serialization.workspaces.load(snapshot, reopened)
assert.deepEqual(
  readProgram(reopened),
  program,
  'closing and opening C must retain connected blocks',
)
const loose = reopened.newBlock('genius_move')
loose.setFieldValue(99, 'COUNT')
assert.deepEqual(readProgram(reopened), program, 'unconnected blocks must not execute')
reopened.dispose()
assert.throws(
  () =>
    expandProgram([
      { kind: 'repeat', count: 100, body: [{ kind: 'move', direction: 'up', count: 100 }] },
    ]),
  /too long/,
  'limit expansion before freezing browser',
)
assert.throws(() => expandProgram([{ kind: 'move', direction: 'up', count: -1 }]), /count/)
let emptyLoop = []
for (let i = 0; i < 4; i++) emptyLoop = [{ kind: 'repeat', count: 100, body: emptyLoop }]
assert.throws(
  () => expandProgram(emptyLoop),
  /too many repeated loops/,
  'nested empty loops must not hang the browser',
)
const blocked = { x: 1, y: 1, z: 1, facing: 0 }
world.place({ x: 1, y: 1, z: 0 }, 'stone')
assert.match(
  executeStep(world, blocked, { kind: 'move', direction: 'forward', count: 1 }, player),
  /blocked/,
)
assert.deepEqual(
  blocked,
  { x: 1, y: 1, z: 1, facing: 0 },
  'blocked moves must not move agent through blocks',
)
assert.equal(executeStep(world, blocked, { kind: 'break', direction: 'forward' }, player), null)
assert.equal(
  executeStep(world, blocked, { kind: 'move', direction: 'forward', count: 1 }, player),
  null,
)
assert.deepEqual(offset({ x: 0, y: 1, z: 0 }, 1, 'forward'), { x: 1, y: 1, z: 0 })
assert.equal(executeStep(world, blocked, { kind: 'turn', direction: 'left' }, player), null)
assert.equal(blocked.facing, 3)
async function checkAgentDirections() {
  const THREE = await import('three')
  const verticalAxis = new THREE.Vector3(0, 1, 0)
  const localDirections = {
    forward: [0, 0, 1],
    back: [0, 0, -1],
    left: [1, 0, 0],
    right: [-1, 0, 0],
    up: [0, 1, 0],
    down: [0, -1, 0],
  }
  for (let facing = 0; facing < 4; facing++) {
    const origin = { x: 0, y: 10, z: 0 }
    for (const [direction, localVector] of Object.entries(localDirections)) {
      const rendered = new THREE.Vector3(...localVector).applyAxisAngle(
        verticalAxis,
        agentRotationY(facing),
      )
      const target = offset(origin, facing, direction)
      const movement = new THREE.Vector3(
        target.x - origin.x,
        target.y - origin.y,
        target.z - origin.z,
      )
      assert.ok(
        rendered.distanceTo(movement) < 1e-9,
        `facing ${facing}: rendered ${direction} matches movement and block actions`,
      )
      const moving = { ...origin, facing }
      assert.equal(executeStep(world, moving, { kind: 'move', direction, count: 1 }, player), null)
      assert.deepEqual(
        moving,
        { ...target, facing },
        'moving must not silently reverse the agent heading',
      )
    }
    for (const direction of ['left', 'right']) {
      const turning = { ...origin, facing }
      assert.equal(executeStep(world, turning, { kind: 'turn', direction }, player), null)
      const before = new THREE.Vector3(0, 0, 1).applyAxisAngle(verticalAxis, agentRotationY(facing))
      const expected = before.applyAxisAngle(
        verticalAxis,
        direction === 'left' ? Math.PI / 2 : -Math.PI / 2,
      )
      const after = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        verticalAxis,
        agentRotationY(turning.facing),
      )
      assert.ok(
        after.distanceTo(expected) < 1e-9,
        `facing ${facing}: visible ${direction} turn matches the code block`,
      )
    }
  }
  console.log(
    'Agent orientation checks passed: rendered movement/build directions and left/right turns match all four headings.',
  )
}
checkAgentDirections().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
assert.ok(!world.break({ x: 0, y: FLOOR, z: 0 }), 'trial floor cannot be removed')
assert.ok(!world.place({ x: 24, y: 1, z: 0 }, 'stone'), 'world boundary enforced')
assert.ok(world.blocks.size < MAX_BLOCKS)
assert.ok(!playerCollides(world, { x: 0, y: 0.5, z: 7 }), 'spawn must be clear')
assert.ok(playerCollides(world, { x: 0, y: 0.2, z: 7 }), 'player cannot pass through ground')
const picked = pickBlock(world, { x: 0, y: 2, z: 0 }, { x: 0, y: -1, z: 0 })
assert.deepEqual(picked.block, { x: 0, y: 0, z: 0 })
assert.deepEqual(picked.adjacent, { x: 0, y: 1, z: 0 })
const fresh = createWorld(42)
assert.equal(
  fresh.get({ x: 3, y: 2, z: -1 }),
  undefined,
  'returning to world must discard built tower',
)
assert.notEqual(fresh.blocks, world.blocks)
console.log(
  'Gameplay checks passed: Blockly run stack, tower execution, loop bounds, collisions, block picking, and fresh worlds.',
)
