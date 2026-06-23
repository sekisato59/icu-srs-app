import type { Progress, Question, StoredCard } from './types'
import { dueDate } from './scheduler'
import { dailyNewCount } from './pacing'

export function isDue(stored: StoredCard, now: Date): boolean {
  return dueDate(stored).getTime() <= now.getTime()
}

export function remainingNewCount(questions: Question[], progress: Progress): number {
  return questions.filter((q) => !(q.id in progress.cards)).length
}

export function buildDailyQueue(questions: Question[], progress: Progress, now: Date) {
  const reviews = questions
    .filter((q) => q.id in progress.cards && isDue(progress.cards[q.id], now))
    .map((q) => q.id)

  const unseen = questions
    .filter((q) => !(q.id in progress.cards))
    .sort((a, b) => a.year - b.year || a.number - b.number)

  const newLimit = dailyNewCount(unseen.length, now, progress.settings)
  const news = unseen.slice(0, newLimit).map((q) => q.id)

  return { reviews, news }
}
