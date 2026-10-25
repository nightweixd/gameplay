import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly/core'
import type { Action } from './model'
import { defineBlocks, readProgram, STARTER_WORKSPACE, type WorkspaceState } from './blocks'
import styles from './gameplay.module.css'
import Dialog from '../../components/Dialog'

export default function BlockEditor({
  state,
  onChange,
  onClose,
  onRun,
}: {
  state: WorkspaceState | null
  onChange: (state: WorkspaceState, program: Action[], error: string) => void
  onClose: () => void
  onRun: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null)
  const initialState = useRef(state)
  const changeCallback = useRef(onChange)
  const [error, setError] = useState('')
  useEffect(() => {
    changeCallback.current = onChange
  }, [onChange])
  useEffect(() => {
    if (!host.current) return
    defineBlocks()
    const editor = Blockly.inject(host.current, {
      media: '/blockly/media/',
      sounds: false,
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Agent',
            colour: '#009ca0',
            contents: ['genius_move', 'genius_turn', 'genius_teleport'].map((type) => ({
              kind: 'block',
              type,
            })),
          },
          {
            kind: 'category',
            name: 'Build',
            colour: '#2673c5',
            contents: ['genius_place', 'genius_break'].map((type) => ({ kind: 'block', type })),
          },
          {
            kind: 'category',
            name: 'Loops',
            colour: '#40a333',
            contents: [{ kind: 'block', type: 'genius_repeat' }],
          },
        ],
      },
      renderer: 'zelos',
      theme: Blockly.Theme.defineTheme('genius', {
        name: 'genius',
        base: Blockly.Themes.Classic,
        fontStyle: { family: 'Segoe UI, sans-serif', weight: '600', size: 12 },
        componentStyles: {
          workspaceBackgroundColour: '#f2f3f5',
          toolboxBackgroundColour: '#fff',
          flyoutBackgroundColour: '#e8edf1',
          flyoutOpacity: 1,
        },
      }),
      grid: { spacing: 24, length: 2, colour: '#dadfe5', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.95, maxScale: 1.5, minScale: 0.45 },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
    })
    workspace.current = editor
    Blockly.serialization.workspaces.load(initialState.current ?? STARTER_WORKSPACE, editor)
    const update = () => {
      try {
        const program = readProgram(editor)
        setError('')
        changeCallback.current(Blockly.serialization.workspaces.save(editor), program, '')
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Check your blocks.'
        setError(message)
        changeCallback.current(Blockly.serialization.workspaces.save(editor), [], message)
      }
    }
    editor.addChangeListener(update)
    update()
    const observer = new ResizeObserver(() => Blockly.svgResize(editor))
    observer.observe(host.current)
    return () => {
      observer.disconnect()
      editor.removeChangeListener(update)
      editor.dispose()
      workspace.current = null
    }
  }, [])

  return (
    <Dialog className={styles.editor} labelId="coding-title" onClose={onClose}>
      <header className={styles.editorHeader}>
        <div className={styles.editorBrand}>
          <span aria-hidden="true">&lt;/&gt;</span>
          <h2 id="coding-title">Code Builder</h2>
        </div>
        <span className={styles.projectName}>Trial project</span>
        <button autoFocus className={styles.lightButton} onClick={onClose}>
          Back to world · C
        </button>
      </header>
      <div className={styles.editorTabs}>
        <span className={styles.blocksTab}>▦ Blocks</span>
        <span>Code your agent</span>
      </div>
      <p className={styles.editorTip}>
        Drag blocks inside <strong>on chat command run</strong>. Back in the world: <kbd>T</kbd> →{' '}
        <strong>run</strong> → <kbd>Enter</kbd>.
      </p>
      <div ref={host} className={styles.blockly} aria-label="Block coding workspace" />
      <footer className={styles.editorFooter}>
        <span role="status">{error || 'Loose blocks outside the run block do not execute.'}</span>
        <button
          className={styles.lightButton}
          onClick={() => {
            if (workspace.current) {
              workspace.current.clear()
              Blockly.serialization.workspaces.load(STARTER_WORKSPACE, workspace.current)
            }
          }}
        >
          Load tower example
        </button>
        <button disabled={!!error} className={styles.playButton} onClick={onRun}>
          Run code
        </button>
      </footer>
    </Dialog>
  )
}
