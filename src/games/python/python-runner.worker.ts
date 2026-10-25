import harness from './harness.py?raw'
import { missions } from './missions'
import type { WorkerReply, WorkerRequest, RunResult } from './types'

const reply = (message: WorkerReply) => self.postMessage(message)

async function start() {
  const loaderURL = new URL('/python-runtime/pyodide.mjs', self.location.origin).href
  const { loadPyodide } = (await import(/* @vite-ignore */ loaderURL)) as typeof import('pyodide')
  const python = await loadPyodide({
    indexURL: new URL('/python-runtime/', self.location.origin).href,
  })
  python.runPython(harness)
  reply({ type: 'ready' })
  self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const { code, inputs, mission } = event.data
    if (
      typeof code !== 'string' ||
      code.length > 20000 ||
      typeof inputs !== 'string' ||
      inputs.length > 4000
    ) {
      reply({
        type: 'error',
        message: 'Keep code below 20,000 characters and input below 4,000 characters.',
      })
      return
    }
    const check = missions.find((item) => item.id === mission)?.check ?? ''
    const run = python.globals.get('run_student')
    try {
      const result = JSON.parse(run(code, inputs, check)) as RunResult
      reply({ type: 'result', result })
    } catch (issue) {
      reply({
        type: 'error',
        message: issue instanceof Error ? issue.message : 'Python could not finish. Try again.',
      })
    } finally {
      run.destroy()
    }
  }
}
void start().catch((issue) =>
  reply({
    type: 'error',
    message: `Python could not load. Check your connection and try again. ${issue instanceof Error ? issue.message : ''}`,
  }),
)
