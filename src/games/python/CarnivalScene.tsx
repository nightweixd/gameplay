import { Apple, Banana, Citrus, Flag, Rocket, Sparkles, Ticket, TreePine } from 'lucide-react'
import type { RunResult } from './types'
import { COLOURS, missions } from './missions'
import styles from './python.module.css'

export default function CarnivalScene({
  mission,
  result,
  completed,
}: {
  mission: string
  result: RunResult | null
  completed: number
}) {
  const view = result?.view
  const lights = view?.lights ?? []
  return (
    <div className={styles.scene} aria-label="Your carnival preview">
      <div className={styles.sceneSky} aria-hidden="true">
        <span className={styles.sun} />
        <span className={styles.cloudOne} />
        <span className={styles.cloudTwo} />
        <span className={styles.hillOne} />
        <span className={styles.hillTwo} />
        <TreePine className={styles.treeOne} size={72} />
        <TreePine className={styles.treeTwo} size={48} />
      </div>
      <div className={styles.bunting} aria-hidden="true">
        {['gold', 'coral', 'blue', 'mint', 'gold', 'coral', 'blue'].map((colour, i) => (
          <i key={i} data-colour={colour} />
        ))}
      </div>
      <div className={styles.festivalSign}>
        Python Carnival<small>Made with a little code</small>
      </div>
      <div className={styles.booth}>
        <div className={styles.boothRoof} />
        <div className={styles.boothSign}>
          {mission === 'welcome' ? (
            <>
              <img src="/brand/geniuscode-logo.png" width="60" height="60" alt="" />
              <strong>
                {result?.output.split('\n')[0].slice(0, 40) || 'Your first Python sign'}
              </strong>
              <span>
                {result
                  ? result.output.trim().split('\n')[1]?.slice(0, 40) || 'Print a number next.'
                  : 'Text and a whole number. That’s it!'}
              </span>
            </>
          ) : null}
          {mission === 'variables' || (mission === 'free' && lights.length === 0) ? (
            <>
              <img src="/brand/geniuscode-logo.png" width="60" height="60" alt="" />
              <strong>{view?.name || 'Hello, explorer!'}</strong>
              <span>{view ? `${view.coins} starting coins` : 'Your adventure starts here'}</span>
            </>
          ) : null}
          {mission === 'cinema' ? (
            <>
              <Ticket size={38} aria-hidden="true" />
              <strong>Moonlight cinema</strong>
              <span className={styles.bigValue}>
                {view?.price ?? '?'} <small>coins</small>
              </span>
              <small>{view ? `Visitor age: ${view.age}` : 'Your code sets the ticket price'}</small>
            </>
          ) : null}
          {mission === 'basket' ? (
            <>
              <strong>Fresh from the grove</strong>
              <div className={styles.fruitShelf}>
                {(view?.fruits.length ? view.fruits : ['apple', 'banana', '?']).map((fruit, i) => (
                  <span key={i}>
                    {fruit === 'apple' ? (
                      <Apple size={32} aria-hidden="true" />
                    ) : fruit === 'banana' ? (
                      <Banana size={32} aria-hidden="true" />
                    ) : fruit === 'orange' ? (
                      <Citrus size={32} aria-hidden="true" />
                    ) : (
                      <span>?</span>
                    )}
                    <small>{fruit}</small>
                  </span>
                ))}
              </div>
              <span>One basket. So many possibilities.</span>
            </>
          ) : null}
          {mission === 'shop' ? (
            <>
              <strong>Snack stop</strong>
              <div className={styles.priceTags}>
                <span>
                  Juice <b>{view?.prices.juice ?? '3'}</b>
                </span>
                <span>
                  Popcorn <b>{view?.prices.popcorn ?? '?'}</b>
                </span>
              </div>
              <span className={styles.bigValue}>
                {view?.total ?? '?'} <small>total coins</small>
              </span>
            </>
          ) : null}
          {mission === 'countdown' ? (
            <>
              <Rocket
                size={45}
                aria-hidden="true"
                className={result?.passed ? styles.launched : ''}
              />
              <strong>Rocket ride</strong>
              <span className={styles.bigValue}>{result?.passed ? 'Go!' : '3 · 2 · 1'}</span>
              <small>
                {result?.passed
                  ? 'Countdown complete. Lift off!'
                  : 'A while loop starts the launch'}
              </small>
            </>
          ) : null}
          {mission === 'lanterns' ? (
            <>
              <Sparkles size={36} aria-hidden="true" />
              <strong>Lantern lane</strong>
              <span>
                {lights.length
                  ? `${lights.length} lanterns lit`
                  : 'Light the trail with your for loop'}
              </span>
              <div className={styles.lanternRow}>
                {(lights.length ? lights : ['off', 'off', 'off', 'off']).map((colour, i) => (
                  <span
                    key={i}
                    className={styles.lantern}
                    data-colour={
                      COLOURS.includes(colour as (typeof COLOURS)[number]) ? colour : 'off'
                    }
                    aria-label={`${colour} lantern`}
                  />
                ))}
              </div>
            </>
          ) : null}
          {mission === 'functions' ? (
            <>
              <Flag size={37} aria-hidden="true" />
              <strong>Everyone’s invited</strong>
              <div className={styles.priceTags}>
                <span>
                  Age 8 <b>{view?.child_ticket ?? '?'}</b>
                </span>
                <span>
                  Age 16 <b>{view?.adult_ticket ?? '?'}</b>
                </span>
              </div>
              <span>One function. Tickets for everyone.</span>
            </>
          ) : null}
          {mission === 'free' && lights.length > 0 && (
            <>
              <strong>Your lantern trail</strong>
              <div className={styles.lanternRow}>
                {lights.map((colour, i) => (
                  <span
                    key={i}
                    className={styles.lantern}
                    data-colour={colour}
                    aria-label={`${colour} lantern`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.boothCounter} />
        <div className={styles.boothBase} />
      </div>
      <div className={styles.path} aria-hidden="true" />
      <span className={styles.sceneProgress}>
        <Ticket size={16} aria-hidden="true" /> {completed} / {missions.length} festival stamps
      </span>
    </div>
  )
}
