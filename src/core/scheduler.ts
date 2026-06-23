import { createEmptyCard, fsrs, generatorParameters, type Card, type StepUnit } from 'ts-fsrs'
import type { Settings, StoredCard } from './types'

/**
 * Build FSRS parameters from Settings.
 *
 * ts-fsrs 5.x: FSRSParameters includes learning_steps and relearning_steps
 * as Steps (StepUnit[]), so we can forward the user's Anki-style step config
 * directly from Settings.
 *
 * settings.learningSteps / relearningSteps are string[] matching the StepUnit
 * pattern `${number}${'m'|'h'|'d'}`, so the cast to StepUnit[] is sound.
 */
export function buildParams(settings: Settings, enableFuzz = true) {
  return generatorParameters({
    enable_fuzz: enableFuzz,
    learning_steps: settings.learningSteps as StepUnit[],
    relearning_steps: settings.relearningSteps as StepUnit[],
  })
}

function serialize(card: Card): StoredCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
    // ts-fsrs v5: Card has a real learning_steps field (current step index)
    learning_steps: card.learning_steps,
  }
}

function deserialize(s: StoredCard): Card {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state as Card['state'],
    last_review: s.last_review ? new Date(s.last_review) : undefined,
    // ts-fsrs v5: Card has a real learning_steps field (current step index)
    learning_steps: s.learning_steps,
  }
}

export function newStoredCard(now: Date): StoredCard {
  return serialize(createEmptyCard(now))
}

export function reviewCard(
  stored: StoredCard,
  rating: 1 | 2 | 3 | 4,
  now: Date,
  settings: Settings,
  enableFuzz = true,
): StoredCard {
  const f = fsrs(buildParams(settings, enableFuzz))
  const result = f.next(deserialize(stored), now, rating)
  return serialize(result.card)
}

export function dueDate(stored: StoredCard): Date {
  return new Date(stored.due)
}
