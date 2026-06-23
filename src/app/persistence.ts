import { openDB, type IDBPDatabase } from 'idb'
import type { Progress, Question } from '../core/types'
import { DEFAULT_SETTINGS } from '../core/types'

const DB_NAME = 'icu-srs'
const STORE = 'kv'
const PROGRESS_KEY = 'progress'
const QUESTIONS_KEY = 'questions'
const PROGRESS_SHA_KEY = 'progressSha'

let dbPromise: Promise<IDBPDatabase> | null = null
function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, { upgrade(db) { db.createObjectStore(STORE) } })
  }
  return dbPromise
}

export function initialProgress(): Progress {
  return { settings: DEFAULT_SETTINGS, cards: {}, reviewLog: [] }
}

export async function loadProgress(): Promise<Progress | null> {
  const db = await getDB()
  return (await db.get(STORE, PROGRESS_KEY)) ?? null
}
export async function saveProgress(p: Progress): Promise<void> {
  const db = await getDB(); await db.put(STORE, p, PROGRESS_KEY)
}
export async function saveQuestions(qs: Question[]): Promise<void> {
  const db = await getDB(); await db.put(STORE, qs, QUESTIONS_KEY)
}
export async function loadQuestionsCache(): Promise<Question[] | null> {
  const db = await getDB(); return (await db.get(STORE, QUESTIONS_KEY)) ?? null
}
export async function loadProgressSha(): Promise<string | null> {
  const db = await getDB(); return (await db.get(STORE, PROGRESS_SHA_KEY)) ?? null
}
export async function saveProgressSha(sha: string): Promise<void> {
  const db = await getDB(); await db.put(STORE, sha, PROGRESS_SHA_KEY)
}
