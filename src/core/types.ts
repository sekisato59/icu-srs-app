export interface Choice { key: string; text: string }
export interface Citation { source: string; page: number | null; quote: string; note: string }
export interface EnrichedExplanation { summary: string; perChoice: Record<string, string>; reviewed: boolean }
export interface Question {
  id: string; year: number; number: number; stem: string; choices: Choice[];
  correct: string[]; selectCount: number; needsImage: boolean; images: string[];
  originalExplanation: string; enrichedExplanation: EnrichedExplanation | null;
  citations: Citation[]; tags: string[]; category: string | null
}
export interface Settings {
  examDate: string; finishBy: string; newCardDeadlineBufferDays: number;
  learningSteps: string[]; relearningSteps: string[]; newPerDayOverride: number | null
}
export interface StoredCard {
  due: string; stability: number; difficulty: number; elapsed_days: number;
  scheduled_days: number; reps: number; lapses: number; state: number;
  last_review: string | null; learning_steps: number
}
export interface ReviewLogEntry { id: string; ts: string; rating: number; correct: boolean }
export interface Progress { settings: Settings; cards: Record<string, StoredCard>; reviewLog: ReviewLogEntry[] }

export const DEFAULT_SETTINGS: Settings = {
  examDate: '2026-10-17',
  finishBy: '2026-10-15',
  newCardDeadlineBufferDays: 21,
  learningSteps: ['1m', '5m', '10m'],
  relearningSteps: ['10m'],
  newPerDayOverride: null,
}
