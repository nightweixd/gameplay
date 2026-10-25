import * as Blockly from 'blockly/core'
import * as English from 'blockly/msg/en'
import { MATERIALS, type Action, type Direction, type Material } from './model'

export type WorkspaceState = ReturnType<typeof Blockly.serialization.workspaces.save>
export const STARTER_WORKSPACE: WorkspaceState = { blocks: { languageVersion: 0, blocks: [{ type: 'genius_run', x: 65, y: 55, deletable: false, inputs: { DO: { block: { type: 'genius_repeat', fields: { COUNT: 4 }, inputs: { DO: { block: { type: 'genius_place', fields: { MATERIAL: 'wood', DIR: 'forward' }, next: { block: { type: 'genius_move', fields: { DIR: 'up', COUNT: 1 } } } } } } } } } }] } }
const directions = [['forward', 'forward'], ['back', 'back'], ['left', 'left'], ['right', 'right'], ['up', 'up'], ['down', 'down']]

export function defineBlocks() {
  // The ESM messages are named exports; the CJS typings also include a default.
  Blockly.setLocale(Object.fromEntries(Object.entries(English).filter((entry): entry is [string, string] => typeof entry[1] === 'string')))
  if (Blockly.Blocks.genius_run) return
  Blockly.common.defineBlocksWithJsonArray([
    { type: 'genius_run', message0: 'on chat command run %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], colour: '#a857c4', tooltip: 'Press T in the world, type run, then Enter.' },
    { type: 'genius_move', message0: 'agent move %1 %2 blocks', args0: [{ type: 'field_dropdown', name: 'DIR', options: directions }, { type: 'field_number', name: 'COUNT', value: 1, min: 1, max: 100, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#009ca0' },
    { type: 'genius_turn', message0: 'agent turn %1', args0: [{ type: 'field_dropdown', name: 'DIR', options: [['left', 'left'], ['right', 'right']] }], previousStatement: null, nextStatement: null, colour: '#009ca0' },
    { type: 'genius_place', message0: 'agent place %1 %2', args0: [{ type: 'field_dropdown', name: 'MATERIAL', options: MATERIALS.map(value => [value, value]) }, { type: 'field_dropdown', name: 'DIR', options: directions }], previousStatement: null, nextStatement: null, colour: '#2673c5' },
    { type: 'genius_break', message0: 'agent break block %1', args0: [{ type: 'field_dropdown', name: 'DIR', options: directions }], previousStatement: null, nextStatement: null, colour: '#2673c5' },
    { type: 'genius_teleport', message0: 'agent come to player', previousStatement: null, nextStatement: null, colour: '#009ca0' },
    { type: 'genius_repeat', message0: 'repeat %1 times %2 %3', args0: [{ type: 'field_number', name: 'COUNT', value: 4, min: 1, max: 100, precision: 1 }, { type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#40a333' },
  ])
}

export function readProgram(workspace: Blockly.Workspace): Action[] {
  function readStack(first: Blockly.Block | null, depth = 0): Action[] {
    if (depth > 12) throw new Error('Use fewer nested repeat blocks.')
    const actions: Action[] = []
    for (let block = first; block; block = block.getNextBlock()) {
      if (!block.isEnabled()) continue
      const direction = block.getFieldValue('DIR') as Direction
      switch (block.type) {
        case 'genius_move': actions.push({ kind: 'move', direction, count: Number(block.getFieldValue('COUNT')) }); break
        case 'genius_turn': actions.push({ kind: 'turn', direction: direction as 'left' | 'right' }); break
        case 'genius_place': actions.push({ kind: 'place', direction, material: block.getFieldValue('MATERIAL') as Material }); break
        case 'genius_break': actions.push({ kind: 'break', direction }); break
        case 'genius_teleport': actions.push({ kind: 'teleport' }); break
        case 'genius_repeat': actions.push({ kind: 'repeat', count: Number(block.getFieldValue('COUNT')), body: readStack(block.getInputTargetBlock('DO'), depth + 1) }); break
        default: throw new Error('This block is not supported.')
      }
    }
    return actions
  }
  const root = workspace.getTopBlocks(true).find(block => block.type === 'genius_run')
  return root ? readStack(root.getInputTargetBlock('DO')) : []
}
