import type { AppState } from './types'

export interface Store {
  getState(): AppState
  setState(patch: Partial<AppState>): void
  subscribe(fn: (s: AppState) => void): () => void
}

export function createStore(initial: AppState): Store {
  let state = initial
  const subs = new Set<(s: AppState) => void>()
  return {
    getState: () => state,
    setState(patch) {
      state = { ...state, ...patch }
      for (const fn of subs) fn(state)
    },
    subscribe(fn) {
      subs.add(fn)
      return () => { subs.delete(fn) }
    },
  }
}
