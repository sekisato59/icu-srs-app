import type { AppState, Screen } from './types'
import type { Question, StoredCard, ReviewLogEntry } from '../core/types'
import { isAnswerCorrect } from './grading'
import { buildDailyQueue } from '../core/session'
import { newStoredCard, reviewCard } from '../core/scheduler'

export function currentQuestion(s: AppState): Question | null {
  if (!s.session) return null
  const id = s.session.queue[s.session.index]
  return s.questions.find((q) => q.id === id) ?? null
}

export function startSession(s: AppState): AppState {
  const { reviews, news } = buildDailyQueue(s.questions, s.progress, s.now)
  const queue = [...reviews, ...news]
  if (queue.length === 0) return { ...s, screen: 'home', session: null }
  return { ...s, screen: 'quiz', session: { queue, index: 0 }, cursor: 0, selected: [], lastResult: null }
}

export function moveCursor(s: AppState, dir: -1 | 1): AppState {
  if (s.screen !== 'quiz') return s
  const q = currentQuestion(s)
  if (!q || q.choices.length === 0) return s
  const n = q.choices.length
  return { ...s, cursor: (s.cursor + dir + n) % n }
}

export function selectChoice(s: AppState, key: string): AppState {
  if (s.screen !== 'quiz') return s
  const q = currentQuestion(s)
  if (!q) return s
  if (q.selectCount === 1) return submitAnswer({ ...s, selected: [key] })
  let selected: string[]
  if (s.selected.includes(key)) selected = s.selected.filter((k) => k !== key)
  else if (s.selected.length < q.selectCount) selected = [...s.selected, key]
  else selected = s.selected
  return { ...s, selected }
}

export function primary(s: AppState): AppState {
  if (s.screen !== 'quiz') return s
  const q = currentQuestion(s)
  if (!q) return s
  if (s.selected.length === q.selectCount) return submitAnswer(s)
  const key = q.choices[s.cursor]?.key
  return key ? selectChoice(s, key) : s
}

export function submitAnswer(s: AppState): AppState {
  if (s.screen !== 'quiz') return s
  const q = currentQuestion(s)
  if (!q || s.selected.length !== q.selectCount) return s
  return { ...s, screen: 'answer', lastResult: { correct: isAnswerCorrect(s.selected, q.correct) } }
}

export function rateCard(s: AppState, rating: 1 | 2 | 3 | 4): AppState {
  if (s.screen !== 'answer' || !s.session) return s
  const q = currentQuestion(s)
  if (!q || !s.lastResult) return s
  const base: StoredCard = s.progress.cards[q.id] ?? newStoredCard(s.now)
  const updated = reviewCard(base, rating, s.now, s.progress.settings)
  const log: ReviewLogEntry = { id: q.id, ts: s.now.toISOString(), rating, correct: s.lastResult.correct }
  const progress = {
    ...s.progress,
    cards: { ...s.progress.cards, [q.id]: updated },
    reviewLog: [...s.progress.reviewLog, log],
  }
  const nextIndex = s.session.index + 1
  if (nextIndex >= s.session.queue.length) {
    return { ...s, progress, screen: 'home' as Screen, session: null, selected: [], lastResult: null, cursor: 0 }
  }
  return { ...s, progress, screen: 'quiz' as Screen, session: { ...s.session, index: nextIndex }, selected: [], lastResult: null, cursor: 0 }
}
