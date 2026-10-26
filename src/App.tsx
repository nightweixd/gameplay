import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Blocks,
  Code2,
  Flag,
  Gamepad2,
  Keyboard,
  Lightbulb,
  Mouse,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import BlockScene from './components/BlockScene'
import Dialog from './components/Dialog'
import Brand from './components/Brand'
import { games } from './games/catalog'

const Minecraft = lazy(() => import('./games/minecraft/Game'))
const Python = lazy(() => import('./games/python/PythonGame'))

class GameBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main className="route-loading">
          <h1>The game couldn’t load.</h1>
          <p>Check your connection, then reload to try again.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>
            Try again
          </button>
          <a href="/">All games</a>
        </main>
      )
    return this.props.children
  }
}

function Welcome() {
  const [help, setHelp] = useState(false)
  const [scratch, minecraft, python, upcoming] = games
  useEffect(() => {
    document.title = 'GeniusCode+ Gameplay · Choose your adventure'
  }, [])
  return (
    <div className="welcome">
      <a className="skip-link" href="#games">
        Skip to games
      </a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a className="nav-home" href="https://www.geniuscodeplus.com/">
            GeniusCode+ website <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <button className="help-button" onClick={() => setHelp(true)}>
            <Lightbulb size={18} aria-hidden="true" /> How to play
          </button>
        </nav>
      </header>
      <main>
        <section className="hero" aria-labelledby="welcome-title">
          <div className="hero-copy">
            <div className="welcome-note">
              <span className="sun-icon">
                <Sparkles size={19} aria-hidden="true" />
              </span>{' '}
              Big ideas start with a little play.
            </div>
            <h1 id="welcome-title">
              Small players.
              <br />
              Endless possibilities.
            </h1>
            <p>
              A playground for curious minds.
              <br className="desktop-break" /> Pick a game, try something new, and see what you can
              create.
            </p>
            <a href="#games" className="primary-button">
              <Gamepad2 size={23} aria-hidden="true" /> Let’s play
            </a>
            <div className="hero-note">
              <ShieldCheck size={17} aria-hidden="true" /> Free to explore. No sign-in needed.
            </div>
          </div>
          <div className="hero-art">
            <div className="art-orbit" />
            <BlockScene />
            <div className="art-note">
              <span className="art-note-icon">
                <Blocks size={19} aria-hidden="true" />
              </span>
              Your ideas. Your world.
            </div>
          </div>
        </section>
        <section className="game-library" id="games" aria-labelledby="games-title">
          <div className="section-heading">
            <div>
              <h2 id="games-title">Choose your adventure</h2>
              <p>What will you make today?</p>
            </div>
            <span className="game-count">
              <span /> {games.filter((game) => game.available).length} adventures to explore
            </span>
          </div>
          <div className="game-grid">
            <article className="game-card scratch-card">
              <a
                className="game-art-link"
                href={scratch.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the Scratch website (opens in a new tab)"
              >
                <div className="scratch-card-art">
                  <div className="playable-label">
                    <ArrowUpRight size={13} aria-hidden="true" /> Official Scratch website
                  </div>
                  <div className="scratch-card-blocks" aria-hidden="true">
                    <span>
                      <Flag size={17} fill="currentColor" /> when flag clicked
                    </span>
                    <span>
                      move <b>10</b> steps
                    </span>
                    <span>
                      say <b>Hello!</b>
                    </span>
                  </div>
                  <span className="art-game-title">
                    Scratch<span>Imagine. Code. Create.</span>
                  </span>
                  <span className="round-play">
                    <ArrowUpRight size={25} aria-hidden="true" />
                  </span>
                </div>
              </a>
              <div className="game-card-copy">
                <div className="game-card-title">
                  <h3>{scratch.title}</h3>
                  <Blocks size={22} aria-hidden="true" />
                </div>
                <p>{scratch.description}</p>
                <div className="skill-tags">
                  {scratch.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <a
                  className="play-game-button"
                  href={scratch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-describedby="scratch-link-note"
                >
                  <ArrowUpRight size={18} aria-hidden="true" /> Open Scratch
                </a>
                <p className="device-note" id="scratch-link-note">
                  Official Scratch website. Opens in a new tab.
                </p>
              </div>
            </article>
            <article className="game-card minecraft-card">
              <a
                className="game-art-link"
                href={minecraft.href}
                aria-label="Play Minecraft Coding World"
              >
                <div className="minecraft-art">
                  <div className="playable-label">
                    <span /> Ready to play
                  </div>
                  <BlockScene small />
                  <span className="art-game-title">
                    Minecraft<span>Coding World</span>
                  </span>
                  <span className="round-play">
                    <Play size={25} aria-hidden="true" fill="currentColor" />
                  </span>
                </div>
              </a>
              <div className="game-card-copy">
                <div className="game-card-title">
                  <h3>{minecraft.title}</h3>
                  <span className="game-device" title="Keyboard and mouse">
                    <Keyboard size={19} aria-hidden="true" />
                    <Mouse size={17} aria-hidden="true" />
                    <span className="sr-only">Keyboard and mouse</span>
                  </span>
                </div>
                <p>{minecraft.description}</p>
                <div className="skill-tags">
                  {minecraft.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <a className="play-game-button" href={minecraft.href}>
                  <Play size={17} aria-hidden="true" fill="currentColor" /> Play Minecraft
                </a>
                <p className="device-note">Best on a computer with a keyboard and mouse.</p>
              </div>
            </article>
            <article className="game-card python-card">
              <a className="game-art-link" href={python.href} aria-label="Play Python Carnival">
                <div className="python-card-art">
                  <div className="playable-label">
                    <span /> Ready to play
                  </div>
                  <div className="python-card-lanterns" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="python-card-code" aria-hidden="true">
                    <Code2 size={29} />
                    <code>
                      for colour in colours:
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;light(colour)
                    </code>
                  </div>
                  <span className="art-game-title">
                    Python<span>Code the carnival</span>
                  </span>
                  <span className="round-play">
                    <Play size={25} aria-hidden="true" fill="currentColor" />
                  </span>
                </div>
              </a>
              <div className="game-card-copy">
                <div className="game-card-title">
                  <h3>{python.title}</h3>
                  <Code2 size={22} aria-hidden="true" />
                </div>
                <p>{python.description}</p>
                <div className="skill-tags">
                  {python.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <a className="play-game-button" href={python.href}>
                  <Play size={17} aria-hidden="true" fill="currentColor" /> Play Python
                </a>
                <p className="device-note">A real Python editor. No installation or sign-in.</p>
              </div>
            </article>
            <article className="future-card">
              <div className="future-doodle" aria-hidden="true">
                <span className="doodle-circle" />
                <span className="doodle-block" />
                <span className="doodle-plus">
                  <Plus size={35} />
                </span>
                <span className="doodle-spark">
                  <Sparkles size={25} />
                </span>
              </div>
              <span className="coming-soon">Coming soon</span>
              <h3>{upcoming.title}</h3>
              <p>{upcoming.description}</p>
              <div className="future-bottom">
                <Gamepad2 size={20} aria-hidden="true" />
                <span>More ways to play, build, and discover.</span>
              </div>
            </article>
          </div>
          <aside className="parent-note">
            <span className="parent-note-icon">
              <Lightbulb size={24} aria-hidden="true" />
            </span>
            <div>
              <h3>A little play. A lot of learning.</h3>
              <p>
                Try ideas, make mistakes, and try again. That’s how great builders and coders begin.
              </p>
            </div>
            <span className="parent-note-blocks" aria-hidden="true">
              <Blocks size={42} />
            </span>
          </aside>
        </section>
      </main>
      <footer className="site-footer">
        <a className="footer-back" href="https://www.geniuscodeplus.com/">
          <ArrowLeft size={16} aria-hidden="true" /> Back to GeniusCode+
        </a>
        <p>Made for curious minds by GeniusCode+.</p>
        <small>
          Independent Minecraft-inspired browser experience. Not affiliated with Mojang or
          Microsoft.
        </small>
      </footer>
      {help && (
        <Dialog
          className="welcome-dialog"
          labelId="welcome-help-title"
          onClose={() => setHelp(false)}
        >
          <button className="dialog-close" aria-label="Close help" onClick={() => setHelp(false)}>
            <X size={22} aria-hidden="true" />
          </button>
          <span className="dialog-icon">
            <Gamepad2 size={30} aria-hidden="true" />
          </span>
          <h2 id="welcome-help-title">How to play</h2>
          <p>Pick an adventure from the main screen. Each one has a different way to create.</p>
          <div className="help-games">
            <section aria-labelledby="help-scratch-title">
              <h3 id="help-scratch-title">
                <Blocks size={20} aria-hidden="true" /> Scratch
              </h3>
              <p>
                Select <strong>Open Scratch</strong> to visit the official Scratch website in a new
                tab. Make stories, games, and animations with coding blocks. Scratch manages its own
                account and sharing options; there is no extra Scratch game inside this playground.
              </p>
            </section>
            <section aria-labelledby="help-minecraft-title">
              <h3 id="help-minecraft-title">
                <Gamepad2 size={20} aria-hidden="true" /> Minecraft
              </h3>
              <ul>
                <li>
                  <strong>Build and explore.</strong> Select Play Minecraft, then Play. Use W A S D
                  to walk, your mouse to look, and Space to jump. Left-click breaks blocks;
                  right-click places them.
                </li>
                <li>
                  <strong>Code your agent.</strong> Press C for Code Builder. Try the tower example,
                  change the blocks, and select Run code.
                </li>
                <li>
                  <strong>Pause anytime.</strong> Press Esc. Use a computer with a keyboard and
                  mouse. The world resets when you leave.
                </li>
              </ul>
            </section>
            <section aria-labelledby="help-python-title">
              <h3 id="help-python-title">
                <Code2 size={20} aria-hidden="true" /> Python Carnival
              </h3>
              <ul>
                <li>
                  <strong>Start small.</strong> Select Play Python and choose a mission. Read the
                  goal and write your code in the blank editor, or continue your saved draft. Begin
                  with strings and integers, then try variables.
                </li>
                <li>
                  <strong>Run and learn.</strong> Select Run Python to see the output and check your
                  work. Need a hint? and See an example can help. Examples do not fill the editor
                  for you.
                </li>
                <li>
                  <strong>Try your own ideas.</strong> Free code is a blank playground without
                  mission checks. For input(), put one answer per line in Input values. Use Stop to
                  end a run; endless loops stop after five seconds.
                </li>
              </ul>
            </section>
          </div>
          <p className="help-reset">
            Minecraft and Python need no account. Python drafts and practice stamps save only in
            this browser. Download important Python code before switching devices or clearing
            browser data.
          </p>
          <button className="primary-button" onClick={() => setHelp(false)}>
            Got it
          </button>
        </Dialog>
      )}
    </div>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/games/python' || path === '/python')
    return (
      <GameBoundary>
        <Suspense
          fallback={
            <main className="route-loading" role="status">
              <Code2 size={44} aria-hidden="true" />
              <h1>Opening Python Carnival…</h1>
              <p>Your code brings the carnival to life.</p>
              <a href="/">All games</a>
            </main>
          }
        >
          <Python />
        </Suspense>
      </GameBoundary>
    )
  if (path === '/games/minecraft' || path === '/minecraft' || path === '/gameplay')
    return (
      <GameBoundary>
        <Suspense
          fallback={
            <main className="route-loading" role="status">
              <Blocks size={44} aria-hidden="true" />
              <h1>Opening your block world…</h1>
              <p>Getting your agent and building blocks ready.</p>
              <a href="/">All games</a>
            </main>
          }
        >
          <Minecraft />
        </Suspense>
      </GameBoundary>
    )
  if (path !== '/')
    return (
      <main className="route-loading">
        <Gamepad2 size={42} aria-hidden="true" />
        <h1>This game isn’t here yet.</h1>
        <a className="primary-button" href="/">
          Choose a game
        </a>
      </main>
    )
  return <Welcome />
}
