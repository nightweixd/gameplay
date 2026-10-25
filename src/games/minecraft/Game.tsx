import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Code2, MessageSquare, Pause, RotateCcw } from 'lucide-react'
import { expandProgram, MATERIALS, type Action, type Agent, type Position } from './model'
import type { WorkspaceState } from './blocks'
import GameWorld, { type WorldControls } from './GameWorld'
import BlockIcon from './BlockIcon'
import Dialog from '../../components/Dialog'
import styles from './gameplay.module.css'

const BlockEditor = lazy(() => import('./BlockEditor'))
type Mode = 'menu' | 'play' | 'coding' | 'chat'
const tower: Action[] = [
  {
    kind: 'repeat',
    count: 4,
    body: [
      { kind: 'place', material: 'wood', direction: 'forward' },
      { kind: 'move', direction: 'up', count: 1 },
    ],
  },
]

export default function Game() {
  const controls = useRef<WorldControls>(null)
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null)
  const program = useRef<Action[]>(tower)
  const programError = useRef('')
  const chatInput = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>('menu')
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const [locked, setLocked] = useState(false)
  const [slot, setSlot] = useState(0)
  const [running, setRunning] = useState(false)
  const [chat, setChat] = useState('')
  const [messages, setMessages] = useState([
    'Press C to code your agent. Press T, type run, then Enter to run your blocks.',
  ])
  const [position, setPosition] = useState({
    player: { x: 0, y: 0.5, z: 7 },
    agent: { x: 3, y: 1, z: 0, facing: 0 },
  })
  const [error, setError] = useState('')
  const [help, setHelp] = useState(false)
  const message = useCallback(
    (text: string) => setMessages((current) => [...current.slice(-4), text]),
    [],
  )
  const onPosition = useCallback(
    (player: Position, agent: Agent) => setPosition({ player, agent }),
    [],
  )
  const onCode = useCallback((state: WorkspaceState, actions: Action[], issue: string) => {
    setWorkspaceState(state)
    program.current = actions
    programError.current = issue
  }, [])
  const play = useCallback(() => {
    setMode('play')
    controls.current?.capture()
  }, [])
  const closeCode = useCallback(() => {
    setMode('play')
    controls.current?.capture()
  }, [])
  const openCode = useCallback(() => {
    setMode('coding')
    controls.current?.release()
    setHelp(false)
  }, [])
  const openChat = useCallback(() => {
    setMode('chat')
    controls.current?.release()
    setHelp(false)
  }, [])
  useEffect(() => {
    if (mode === 'chat') chatInput.current?.focus()
  }, [mode])
  useEffect(() => {
    document.title = 'Minecraft Coding World · GeniusCode+ Gameplay'
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.defaultPrevented)
        return
      const target = event.target as HTMLElement
      if (target.matches('input,textarea,select,[contenteditable="true"]') || help) return
      if (event.code === 'KeyC' && mode !== 'menu' && mode !== 'chat') {
        event.preventDefault()
        if (mode === 'coding') closeCode()
        else openCode()
      }
      if (event.code === 'KeyT' && mode === 'play') {
        event.preventDefault()
        openChat()
      }
      if (event.code === 'Escape' && mode === 'chat') {
        setMode('play')
        setChat('')
      }
      if (mode === 'play' && /^Digit[1-9]$/.test(event.code))
        setSlot(Number(event.code.slice(-1)) - 1)
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [mode, help, closeCode, openCode, openChat])

  const runProgram = () => {
    if (running) {
      message('Your agent is already running. Stop it first.')
      return
    }
    try {
      if (programError.current) throw new Error(programError.current)
      const steps = expandProgram(program.current)
      if (!steps.length) {
        message('Add blocks inside on chat command run first.')
        return
      }
      controls.current?.run(steps)
      message(`Running ${steps.length} agent steps.`)
    } catch (issue) {
      message(issue instanceof Error ? issue.message : 'Check your blocks.')
    }
  }
  const submitChat = (event: FormEvent) => {
    event.preventDefault()
    const command = chat.trim().toLowerCase()
    setChat('')
    play()
    if (!command) return
    message(`> ${command}`)
    if (command === 'stop') {
      controls.current?.stop()
      message('Agent stopped.')
      return
    }
    if (command === 'help') {
      message('run = run your blocks · stop = stop agent · agent = bring agent to you')
      return
    }
    if (command === 'agent') {
      controls.current?.run([{ kind: 'teleport' }])
      return
    }
    if (command !== 'run') {
      message('Type run to execute your blocks, or help for commands.')
      return
    }
    runProgram()
  }

  return (
    <main className={styles.game}>
      <GameWorld
        ref={controls}
        active={mode === 'play' && locked && !help}
        material={MATERIALS[slot]}
        onLock={setLocked}
        onMessage={message}
        onRunning={setRunning}
        onPosition={onPosition}
        onError={setError}
        onReady={onReady}
      />
      <div className={styles.shade} />
      {mode !== 'menu' && (
        <>
          <header className={styles.topbar}>
            <button
              className={styles.squareButton}
              aria-label="Pause game"
              title="Pause · Esc"
              onClick={() => controls.current?.release()}
            >
              <Pause size={20} aria-hidden="true" />
            </button>
            <button
              className={styles.squareButton}
              aria-label="Chat and commands"
              title="Chat · T"
              onClick={openChat}
            >
              <MessageSquare size={20} aria-hidden="true" />
            </button>
            <button
              className={styles.squareButton}
              aria-label="Code Builder"
              title="Code Builder · C"
              onClick={openCode}
            >
              <Code2 size={20} aria-hidden="true" />
            </button>
          </header>
          <div className={styles.coordinates}>
            Position: {Math.round(position.player.x)}, {Math.round(position.player.y)},{' '}
            {Math.round(position.player.z)}
            {running && <span>Agent is running…</span>}
          </div>
          {running && (
            <button className={styles.stopButton} onClick={() => controls.current?.stop()}>
              Stop agent
            </button>
          )}
          {mode === 'play' && locked && <div className={styles.crosshair} aria-hidden="true" />}
          <div
            className={styles.chatLog}
            data-expanded={mode === 'chat'}
            role="log"
            aria-live="polite"
          >
            {messages.map((text, index) => (
              <p key={`${index}-${text}`}>{text}</p>
            ))}
          </div>
          <div className={styles.hotbar} role="toolbar" aria-label="Block inventory">
            {MATERIALS.map((material, index) => (
              <button
                key={material}
                className={`${styles.slot} ${slot === index ? styles.selected : ''}`}
                aria-pressed={slot === index}
                aria-label={`${index + 1}: ${material}`}
                onClick={() => setSlot(index)}
              >
                <BlockIcon material={material} />
                <small>{index + 1}</small>
              </button>
            ))}
          </div>
          <span className={styles.selectedName}>{MATERIALS[slot]}</span>
        </>
      )}
      {mode === 'menu' && (
        <div className={`${styles.cover} ${styles.startCover}`}>
          <section className={styles.menu} aria-label="Minecraft start menu">
            <h1 className={styles.logo}>MINECRAFT</h1>
            <p className={styles.edition}>CODING WORLD</p>
            <p className={styles.splash}>Build something brilliant!</p>
            <div className={styles.menuButtons}>
              <button className={styles.playButton} disabled={!!error || !ready} onClick={play}>
                {error ? 'World unavailable' : ready ? 'Play' : 'Preparing world…'}
              </button>
              <button className={styles.lightButton} onClick={() => setHelp(true)}>
                How to Play
              </button>
              <a href="/" className={styles.lightButton}>
                All games
              </a>
            </div>
            <p className={styles.note}>
              Keyboard + mouse · A fresh world every visit
              <br />
              Your world and code reset when you leave.
            </p>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </section>
          <span className={styles.cornerNote}>GeniusCode+ · Independent browser trial</span>
        </div>
      )}
      {mode === 'play' && !locked && !help && (
        <div className={styles.cover}>
          <section className={styles.pauseLayout} aria-label="Pause menu">
            <div className={styles.pauseMenu}>
              <h2 className={styles.logo}>MINECRAFT</h2>
              <p className={styles.edition}>CODING WORLD</p>
              <button autoFocus className={styles.playButton} onClick={play}>
                Resume Game
              </button>
              <button className={styles.lightButton} onClick={openCode}>
                Code Builder
              </button>
              <button className={styles.lightButton} onClick={() => setHelp(true)}>
                How to Play
              </button>
              <button
                className={styles.lightButton}
                onClick={() => {
                  controls.current?.resetAgent()
                  message('Agent returned to the starting point.')
                }}
              >
                <RotateCcw size={15} aria-hidden="true" /> Reset agent
              </button>
              <a href="/" className={styles.lightButton}>
                All games
              </a>
              <p className={styles.note}>Your world and code reset when you leave.</p>
            </div>
            <div className={styles.worldCard}>
              <h3>Coding World</h3>
              <div className={styles.agentAvatar} aria-hidden="true">
                <div />
                <span />
                <i />
              </div>
              <p>Your Agent</p>
              <span>Creative · Individual world</span>
              <p className={styles.mission}>
                Build a tower!
                <br />
                Press C to edit your blocks.
                <br />
                Press T and type run.
              </p>
            </div>
          </section>
        </div>
      )}
      {help && (
        <Dialog className={styles.helpDialog} labelId="help-title" onClose={() => setHelp(false)}>
          <section className={styles.pause}>
            <h2 id="help-title">How to Play</h2>
            <dl className={styles.controlList}>
              <dt>W A S D</dt>
              <dd>Walk</dd>
              <dt>Mouse</dt>
              <dd>Look around</dd>
              <dt>Space</dt>
              <dd>Jump</dd>
              <dt>Shift</dt>
              <dd>Walk faster</dd>
              <dt>F</dt>
              <dd>Toggle flight</dd>
              <dt>Space / Shift</dt>
              <dd>Fly up / down</dd>
              <dt>Left / right click</dt>
              <dd>Break / place block</dd>
              <dt>1–9</dt>
              <dd>Select a block</dd>
              <dt>C</dt>
              <dd>Open block coding</dd>
              <dt>T → run → Enter</dt>
              <dd>Run your code</dd>
              <dt>Esc</dt>
              <dd>Pause / release mouse</dd>
            </dl>
            <button className={styles.playButton} onClick={() => setHelp(false)}>
              Back
            </button>
          </section>
        </Dialog>
      )}
      {mode === 'coding' && (
        <Suspense
          fallback={
            <div className={styles.loading} role="status">
              Opening Code Builder…
            </div>
          }
        >
          <BlockEditor
            state={workspaceState}
            onChange={onCode}
            onClose={closeCode}
            onRun={() => {
              closeCode()
              runProgram()
            }}
          />
        </Suspense>
      )}
      {mode === 'chat' && (
        <Dialog
          className={styles.chatDialog}
          labelId="chat-label"
          onClose={() => {
            setMode('play')
            setChat('')
          }}
        >
          <form onSubmit={submitChat}>
            <label id="chat-label" htmlFor="chat-command">
              Chat and commands <small>Just you and your agent. This is not a public chat.</small>
            </label>
            <div className={styles.chatRow}>
              <input
                id="chat-command"
                ref={chatInput}
                autoFocus
                value={chat}
                maxLength={100}
                autoComplete="off"
                placeholder="Type run, then press Enter"
                onChange={(event) => setChat(event.target.value)}
              />
              <button type="submit" className={styles.lightButton}>
                Send
              </button>
              <button type="button" className={styles.lightButton} onClick={play}>
                Close
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {error && mode !== 'menu' && (
        <div className={styles.cover}>
          <section className={styles.pause}>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <a className={styles.lightButton} href="/">
              All games
            </a>
          </section>
        </div>
      )}
    </main>
  )
}
