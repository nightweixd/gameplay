import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Download,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Square,
  Ticket,
  X,
} from 'lucide-react'
import Brand from '../../components/Brand'
import Dialog from '../../components/Dialog'
import { FREE_CODE, FREE_INPUT, missions } from './missions'
import { emptyNotebook, NOTEBOOK_KEY, readNotebook, type Draft } from './notebook'
import { runPython } from './runner'
import type { RunResult } from './types'
import CarnivalScene from './CarnivalScene'
import styles from './python.module.css'

type Phase = 'idle' | 'loading' | 'running'

export default function PythonGame() {
  const [notebook, setNotebook] = useState(() => {
    try {
      return readNotebook(localStorage)
    } catch {
      return emptyNotebook()
    }
  })
  const [selected, setSelected] = useState(missions[0].id)
  const [free, setFree] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<RunResult | null>(null)
  const [runtimeError, setRuntimeError] = useState('')
  const [hint, setHint] = useState(false)
  const [example, setExample] = useState(false)
  const [reset, setReset] = useState(false)
  const [help, setHelp] = useState(false)
  const [saved, setSaved] = useState(true)
  const editor = useRef<HTMLTextAreaElement>(null)
  const active = useRef<ReturnType<typeof runPython> | null>(null)
  const generation = useRef(0)
  const mission = missions.find((item) => item.id === selected) ?? missions[0]
  const id = free ? 'free' : mission.id
  const fallback: Draft = free
    ? { code: FREE_CODE, inputs: FREE_INPUT }
    : { code: mission.starter, inputs: mission.inputs }
  const draft = notebook.drafts[id] ?? fallback
  const busy = phase !== 'idle'

  useEffect(() => {
    document.title = 'Python Carnival · GeniusCode+ Gameplay'
    return () => {
      generation.current++
      active.current?.stop()
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebook))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [notebook])

  const updateDraft = (next: Partial<Draft>) =>
    setNotebook((current) => ({
      ...current,
      drafts: { ...current.drafts, [id]: { ...draft, ...next } },
    }))
  const resetView = () => {
    generation.current++
    active.current?.stop()
    active.current = null
    setPhase('idle')
    setResult(null)
    setRuntimeError('')
    setHint(false)
    setExample(false)
  }
  const choose = (next: string) => {
    resetView()
    setFree(false)
    setSelected(next)
  }
  const chooseMode = (mode: boolean) => {
    resetView()
    setFree(mode)
  }
  const run = async () => {
    if (busy || !draft.code.trim()) return
    const version = ++generation.current
    setResult(null)
    setRuntimeError('')
    try {
      const job = runPython(
        { code: draft.code, inputs: draft.inputs, mission: free ? '' : mission.id },
        setPhase,
      )
      active.current = job
      const next = await job.promise
      if (generation.current !== version) return
      setResult(next)
      if (next.passed && !free)
        setNotebook((current) => ({
          ...current,
          completed: [...new Set([...current.completed, mission.id])],
        }))
    } catch (issue) {
      if (generation.current === version)
        setRuntimeError(
          issue instanceof Error ? issue.message : 'Python could not finish. Try again.',
        )
    } finally {
      if (generation.current === version) {
        setPhase('idle')
        active.current = null
      }
    }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([draft.code], { type: 'text/x-python;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = free ? 'my-python-playground.py' : `python-carnival-${id}.py`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const indent = () => {
    const field = editor.current
    if (!field) return
    const start = field.selectionStart,
      end = field.selectionEnd
    if (draft.code.length > 19996) return
    updateDraft({ code: `${draft.code.slice(0, start)}    ${draft.code.slice(end)}` })
    requestAnimationFrame(() => {
      field.focus()
      field.setSelectionRange(start + 4, start + 4)
    })
  }
  const nextMission = missions[missions.findIndex((item) => item.id === mission.id) + 1]

  return (
    <div className={styles.page}>
      <a className="skip-link" href="#python-editor">
        Skip to code editor
      </a>
      <header className={styles.header}>
        <Brand />
        <nav aria-label="Python navigation">
          <a href="/" className={styles.allGames}>
            <ArrowLeft size={17} aria-hidden="true" /> All games
          </a>
          <button onClick={() => setHelp(true)} className={styles.helpButton}>
            <HelpCircle size={18} aria-hidden="true" /> <span>How to play</span>
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1>Python Carnival</h1>
            <p>A little Python. A whole world of possibilities.</p>
          </div>
          <div className={styles.modeSwitch} aria-label="Play mode">
            <button aria-pressed={!free} onClick={() => chooseMode(false)}>
              Missions
            </button>
            <button aria-pressed={free} onClick={() => chooseMode(true)}>
              <Code2 size={16} aria-hidden="true" /> Free code
            </button>
          </div>
        </div>
        <div className={styles.layout}>
          <aside className={styles.missionSidebar}>
            <div className={styles.trailHeading}>
              <Ticket size={20} aria-hidden="true" />
              <h2>Your festival trail</h2>
              <span>
                {notebook.completed.length}/{missions.length}
              </span>
            </div>
            <p className={styles.trailIntro}>
              Eight little challenges. Six course modules. Start anywhere.
            </p>
            <nav className={styles.missionList} aria-label="Carnival missions">
              {missions.map((item, i) => (
                <button
                  key={item.id}
                  aria-current={!free && item.id === selected ? 'step' : undefined}
                  onClick={() => choose(item.id)}
                >
                  <span
                    className={styles.missionNumber}
                    data-complete={notebook.completed.includes(item.id)}
                  >
                    {notebook.completed.includes(item.id) ? (
                      <Check size={16} aria-label="Completed" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span>
                    <small>{item.topic}</small>
                    <strong>{item.title}</strong>
                  </span>
                </button>
              ))}
            </nav>
            <p className={styles.saveNote}>
              {saved
                ? 'Drafts and stamps save in this browser only.'
                : 'Browser storage is unavailable. Download your code before leaving.'}
              <br />
              Use made-up names, not personal details.
            </p>
          </aside>
          <section
            className={styles.workspace}
            aria-label={free ? 'Free Python playground' : mission.title}
          >
            <div className={styles.brief}>
              <span className={styles.module}>
                {free ? 'Your own adventure' : `Module ${mission.module}`}
              </span>
              <h2>{free ? 'What will you create?' : mission.title}</h2>
              <p>
                {free
                  ? 'Write real Python, test an idea, or remix a course project. Try print(), input(), loops, lists and functions. light() adds coloured lanterns to the preview.'
                  : mission.story}
              </p>
              {!free && (
                <div className={styles.goal}>
                  <strong>Your mission</strong>
                  <p>{mission.goal}</p>
                </div>
              )}
            </div>
            <section className={styles.editorPanel} aria-labelledby="editor-title">
              <div className={styles.editorHeading}>
                <h3 id="editor-title">
                  <Code2 size={17} aria-hidden="true" /> {free ? 'playground.py' : 'main.py'}
                </h3>
                <div>
                  <button onClick={indent} disabled={busy} title="Insert four spaces at the cursor">
                    Indent
                  </button>
                  <button onClick={() => setReset(true)} disabled={busy} aria-label="Reset code">
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>
                  <button onClick={download} aria-label="Download Python code">
                    <Download size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <label className="sr-only" htmlFor="python-editor">
                Python code
              </label>
              <textarea
                ref={editor}
                id="python-editor"
                className={styles.editor}
                value={draft.code}
                onChange={(event) => updateDraft({ code: event.target.value })}
                disabled={busy}
                maxLength={20000}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-describedby="editor-instructions"
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault()
                    void run()
                  }
                }}
              />
              <div className={styles.editorActions}>
                <span id="editor-instructions">
                  Four spaces indent a block. Ctrl / ⌘ + Enter runs code.
                </span>
                <div>
                  {busy ? (
                    <button className={styles.stopButton} onClick={() => active.current?.stop()}>
                      <Square size={15} aria-hidden="true" fill="currentColor" /> Stop
                    </button>
                  ) : (
                    <button
                      className={styles.runButton}
                      onClick={() => void run()}
                      disabled={!draft.code.trim()}
                    >
                      <Play size={16} aria-hidden="true" fill="currentColor" /> Run Python
                    </button>
                  )}
                </div>
              </div>
            </section>
            <details className={styles.inputPanel} open={Boolean(draft.inputs) || free}>
              <summary>
                <ChevronDown size={16} aria-hidden="true" /> Input values <span>for input()</span>
              </summary>
              <label htmlFor="python-inputs">
                One answer per line, in the order your program asks.
              </label>
              <textarea
                id="python-inputs"
                value={draft.inputs}
                maxLength={4000}
                onChange={(event) => updateDraft({ inputs: event.target.value })}
                disabled={busy}
                rows={2}
                placeholder="For example: 9"
              />
            </details>
            {!free && (
              <div className={styles.learningTools}>
                <button aria-expanded={hint} onClick={() => setHint((value) => !value)}>
                  <Lightbulb size={16} aria-hidden="true" /> {hint ? 'Hide hint' : 'Need a hint?'}
                </button>
                <button aria-expanded={example} onClick={() => setExample((value) => !value)}>
                  See an example
                </button>
              </div>
            )}
            {hint && !free && (
              <div className={styles.hint}>
                <strong>A small nudge</strong>
                <p>{mission.hint}</p>
              </div>
            )}
            {example && !free && (
              <div className={styles.example}>
                <strong>Read it, then make it your own.</strong>
                <pre>{mission.solution}</pre>
                <p>
                  Compare the example with your code. You can type your own version in the editor.
                </p>
              </div>
            )}
          </section>
          <aside className={styles.previewColumn}>
            <div className={styles.previewHeading}>
              <span className={styles.liveDot} /> Your code brings it to life
            </div>
            <CarnivalScene
              mission={free ? 'free' : mission.id}
              result={result}
              completed={notebook.completed.length}
            />
            <section className={styles.resultPanel} aria-labelledby="output-title">
              <div className={styles.outputHeading}>
                <h2 id="output-title">Your program’s output</h2>
                <span>Python 3.14</span>
              </div>
              <div className={styles.runStatus} role="status" aria-live="polite">
                {phase === 'loading'
                  ? 'Loading Python… The first run downloads about 14 MB.'
                  : phase === 'running'
                    ? 'Running your Python… You can stop it at any time.'
                    : runtimeError ||
                      result?.feedback ||
                      'Write a little code, then press Run Python.'}
              </div>
              {result?.error && <p className={styles.errorText}>{result.error}</p>}
              <pre className={styles.output} aria-label="Python output">
                {result?.output ||
                  (result
                    ? '(No printed output. Use print() to show a value.)'
                    : '# Your output will appear here.\n# Try it. Change it. Try again.')}
              </pre>
              {result?.detail && (
                <details className={styles.errorDetails}>
                  <summary>See Python error details</summary>
                  <pre>{result.detail}</pre>
                </details>
              )}
              {result?.passed && !free && (
                <div className={styles.success}>
                  <span>
                    <Check size={18} aria-hidden="true" /> Festival stamp earned!
                  </span>
                  {nextMission ? (
                    <button onClick={() => choose(nextMission.id)}>
                      Next mission <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  ) : (
                    <button onClick={() => chooseMode(true)}>
                      Try free code <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </section>
            <div className={styles.runtimeNote}>
              <strong>Real Python, right here.</strong>
              <p>
                Runs on your device, not a compiler server. No code or input is uploaded.
                Five-second run limit. Standard Python only; no pip installs or desktop graphics.
              </p>
              <code>light("blue")</code>
              <span>Special helper: blue, gold, mint, coral or plum.</span>
            </div>
          </aside>
        </div>
      </main>
      <footer className={styles.footer}>
        A GeniusCode+ playground inspired by the Basic Python course. Stamps are for practice, not
        certificates.
      </footer>
      {reset && (
        <Dialog className="welcome-dialog" labelId="reset-title" onClose={() => setReset(false)}>
          <h2 id="reset-title">Reset this code?</h2>
          <p>
            This clears the current code and restores the default input values. Your other drafts
            and earned stamps stay.
          </p>
          <div className={styles.dialogActions}>
            <button onClick={() => setReset(false)}>Keep my code</button>
            <button
              onClick={() => {
                updateDraft(fallback)
                setResult(null)
                setRuntimeError('')
                setReset(false)
              }}
            >
              Reset code
            </button>
          </div>
        </Dialog>
      )}
      {help && (
        <Dialog
          className="welcome-dialog"
          labelId="python-help-title"
          onClose={() => setHelp(false)}
        >
          <button className="dialog-close" aria-label="Close help" onClick={() => setHelp(false)}>
            <X size={21} aria-hidden="true" />
          </button>
          <h2 id="python-help-title">Bring the carnival to life.</h2>
          <p>
            Choose a mission, read the goal, and write your code in the blank editor. Run Python to
            see your output and check your work. The hint and example can help if you get stuck.
          </p>
          <ol>
            <li>Python cares about spaces. Use four spaces inside a decision, loop or function.</li>
            <li>
              If your code uses input(), put one answer per line in Input values before running.
            </li>
            <li>
              Free code lets you experiment without mission checks. light("gold") lights a lantern.
            </li>
          </ol>
          <p>
            Your code runs in a separate browser worker. Stop ends the run; endless loops stop after
            five seconds. Only run code you understand. Drafts and practice stamps are saved on this
            device, not in a student account.
          </p>
          <button className="primary-button" onClick={() => setHelp(false)}>
            Let’s code
          </button>
        </Dialog>
      )}
    </div>
  )
}
