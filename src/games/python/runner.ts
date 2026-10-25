import type { RunResult, WorkerReply, WorkerRequest } from './types'

export const EXECUTION_LIMIT = 5000
export const LOAD_LIMIT = 45000

// A fresh, terminable worker for every run prevents one exercise changing the next.
export function runPython(request: WorkerRequest, onPhase: (phase: 'loading' | 'running') => void) {
  const worker = new Worker(new URL('./python-runner.worker.ts', import.meta.url), {
    type: 'module',
  })
  let settled = false
  let rejectRun: (reason: Error) => void
  let timer: ReturnType<typeof setTimeout>
  const dispose = () => {
    clearTimeout(timer)
    worker.terminate()
  }
  const promise = new Promise<RunResult>((resolve, reject) => {
    rejectRun = reject
    const fail = (message: string) => {
      if (settled) return
      settled = true
      dispose()
      reject(new Error(message))
    }
    onPhase('loading')
    timer = setTimeout(
      () => fail('Python took too long to load. Check your connection and try again.'),
      LOAD_LIMIT,
    )
    worker.onerror = () =>
      fail('The Python worker could not start. Reload or try a current browser.')
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      if (settled) return
      if (event.data.type === 'ready') {
        clearTimeout(timer)
        onPhase('running')
        timer = setTimeout(
          () =>
            fail(
              'Stopped after 5 seconds. Check for an endless loop and make sure your loop changes its condition.',
            ),
          EXECUTION_LIMIT,
        )
        worker.postMessage(request)
      } else if (event.data.type === 'result') {
        settled = true
        dispose()
        resolve(event.data.result)
      } else if (event.data.type === 'error') fail(event.data.message)
    }
  })
  return {
    promise,
    stop() {
      if (settled) return
      settled = true
      dispose()
      rejectRun(new Error('Stopped. Your code is still here; change it and run again.'))
    },
  }
}
