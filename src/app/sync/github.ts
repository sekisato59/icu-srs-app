import type { SyncConfig } from './config'
import { utf8ToBase64, base64ToUtf8 } from './base64'

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>
export interface GithubFile { content: string; sha: string }
export interface GithubClient {
  getFile(path: string): Promise<GithubFile | null>
  putFile(path: string, content: string, message: string, sha?: string): Promise<{ sha: string }>
}

export function createGithubClient(config: SyncConfig, fetchFn: FetchFn = fetch): GithubClient {
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}/contents`
  const headers = {
    'Authorization': `Bearer ${config.token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  return {
    async getFile(path) {
      const res = await fetchFn(`${base}/${path}?ref=${config.branch}`, { headers })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`GitHub getFile ${path}: ${res.status}`)
      const body = await res.json() as { content: string; sha: string }
      return { content: base64ToUtf8(body.content), sha: body.sha }
    },
    async putFile(path, content, message, sha) {
      const body: Record<string, unknown> = { message, content: utf8ToBase64(content), branch: config.branch }
      if (sha) body.sha = sha
      const res = await fetchFn(`${base}/${path}`, {
        method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`GitHub putFile ${path}: ${res.status}`)
      const json = await res.json() as { content: { sha: string } }
      return { sha: json.content.sha }
    },
  }
}
