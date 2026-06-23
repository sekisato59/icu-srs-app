import type { Question } from '../../core/types'

export function parseQuestionsFile(text: string): Question[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('questions file must be a JSON array')
  for (const item of data) {
    if (!item || typeof item.id !== 'string') throw new Error('each question needs a string id')
  }
  return data as Question[]
}
