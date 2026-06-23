import type { GithubClient } from './github'
import type { Progress, Question } from '../../core/types'

export const QUESTIONS_PATH = 'questions.json'
export const PROGRESS_PATH = 'progress.json'

export function mergeProgress(a: Progress, b: Progress): Progress {
  return b.reviewLog.length > a.reviewLog.length ? b : a
}

export async function pullQuestions(client: GithubClient): Promise<Question[] | null> {
  const file = await client.getFile(QUESTIONS_PATH)
  return file ? (JSON.parse(file.content) as Question[]) : null
}

export async function pullProgress(client: GithubClient): Promise<{ progress: Progress; sha: string } | null> {
  const file = await client.getFile(PROGRESS_PATH)
  return file ? { progress: JSON.parse(file.content) as Progress, sha: file.sha } : null
}

export async function pushProgress(client: GithubClient, progress: Progress, message: string, sha?: string): Promise<{ sha: string }> {
  return client.putFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), message, sha)
}

export async function fullSync(client: GithubClient, localProgress: Progress, localSha: string | null, message: string) {
  const questions = await pullQuestions(client)
  const remote = await pullProgress(client)
  const merged = remote ? mergeProgress(remote.progress, localProgress) : localProgress
  const sha = remote?.sha ?? localSha ?? undefined
  const pushed = await pushProgress(client, merged, message, sha)
  return { questions, progress: merged, sha: pushed.sha }
}
