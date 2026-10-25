import { missions } from './missions'

export const NOTEBOOK_KEY = 'geniuscode.python-carnival.v1'
export type Draft = { code: string; inputs: string }
export type Notebook = { version: 1; completed: string[]; drafts: Record<string, Draft> }
export const emptyNotebook = (): Notebook => ({ version: 1, completed: [], drafts: {} })

export function readNotebook(storage: Pick<Storage, 'getItem'>): Notebook {
  try {
    const raw = storage.getItem(NOTEBOOK_KEY)
    if (!raw || raw.length > 220000) return emptyNotebook()
    const data = JSON.parse(raw)
    if (data?.version !== 1) return emptyNotebook()
    const ids = [...missions.map((item) => item.id), 'free']
    const completed = Array.isArray(data.completed)
      ? [
          ...new Set<string>(
            data.completed.filter(
              (id: unknown) => typeof id === 'string' && ids.includes(id) && id !== 'free',
            ),
          ),
        ]
      : []
    const drafts: Record<string, Draft> = {}
    for (const id of ids) {
      const draft = data.drafts?.[id]
      if (
        typeof draft?.code === 'string' &&
        draft.code.length <= 20000 &&
        typeof draft?.inputs === 'string' &&
        draft.inputs.length <= 4000
      )
        drafts[id] = { code: draft.code, inputs: draft.inputs }
    }
    return { version: 1, completed, drafts }
  } catch {
    return emptyNotebook()
  }
}
