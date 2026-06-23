import type { Question, Progress } from '../core/types'

export type Screen = 'home' | 'quiz' | 'answer' | 'coverage' | 'setup'

export interface AppState {
  questions: Question[]
  progress: Progress
  screen: Screen
  session: { queue: string[]; index: number } | null
  cursor: number
  selected: string[]
  lastResult: { correct: boolean } | null
  now: Date
  syncStatus: string
}

export type InputAction =
  | { type: 'move'; dir: -1 | 1 }
  | { type: 'select'; choice: string }
  | { type: 'primary' }
  | { type: 'back' }
  | { type: 'rate'; rating: 1 | 2 | 3 | 4 }

export interface Actions {
  startSession(): void
  moveCursor(dir: -1 | 1): void
  selectChoice(key: string): void
  primary(): void
  submitAnswer(): void
  rateCard(rating: 1 | 2 | 3 | 4): void
  goHome(): void
  openCoverage(): void
  openSetup(): void
  saveSyncConfig(token: string, owner: string, repo: string, branch: string): void
  runSync(): void
  runSyncAsync(): Promise<void>
  importLocalQuestions(text: string): void
}
