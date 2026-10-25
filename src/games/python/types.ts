export type RunResult = {
  output: string
  error: string
  detail: string
  passed: boolean
  feedback: string
  view: {
    name: string
    coins: string
    age: string
    price: string
    total: string
    fruits: string[]
    prices: Record<string, string>
    lights: string[]
    count: string
    child_ticket: string
    adult_ticket: string
  }
}
export type WorkerRequest = { code: string; inputs: string; mission: string }
export type WorkerReply =
  { type: 'ready' } | { type: 'result'; result: RunResult } | { type: 'error'; message: string }
