import './styles.css'
import { createStore, type Store } from './store'
import { initialProgress, loadProgress, saveProgress, loadQuestionsCache, saveQuestions, loadProgressSha, saveProgressSha } from './persistence'
import * as rt from './session-runtime'
import { renderHome } from './screens/home'
import { renderQuiz } from './screens/quiz'
import { renderAnswer } from './screens/answer'
import { renderCoverage } from './screens/coverage'
import { renderSetup } from './screens/setup'
import { mapGamepadEdges } from './inputs/gamepad'
import { mapKeyToAction } from './inputs/keyboard'
import { loadConfig, saveConfig } from './sync/config'
import { createGithubClient, type FetchFn } from './sync/github'
import { fullSync } from './sync/sync'
import { parseQuestionsFile } from './sync/import-local'
import type { AppState, Actions, InputAction } from './types'

type Persist = { saveProgress: (p: AppState['progress']) => Promise<void> }

export function buildActions(store: Store, persist: Persist, fetchFn: FetchFn = fetch): Actions {
  const persistNow = () => { void persist.saveProgress(store.getState().progress) }

  const runSyncAsync = async (): Promise<void> => {
    const cfg = loadConfig()
    if (!cfg) { store.setState({ screen: 'setup', syncStatus: '先にトークンとリポジトリを設定してください' }); return }
    store.setState({ syncStatus: '同期中…' })
    try {
      const client = createGithubClient(cfg, fetchFn)
      const localSha = await loadProgressSha()
      const r = await fullSync(client, store.getState().progress, localSha, `update progress ${new Date().toISOString()}`)
      if (r.questions) await saveQuestions(r.questions)
      await saveProgress(r.progress)
      await saveProgressSha(r.sha)
      store.setState({
        questions: r.questions ?? store.getState().questions,
        progress: r.progress, syncStatus: '同期しました', screen: 'home',
      })
    } catch (e) {
      store.setState({ syncStatus: '同期に失敗: ' + (e instanceof Error ? e.message : String(e)) })
    }
  }

  return {
    startSession: () => store.setState(rt.startSession(store.getState())),
    moveCursor: (dir) => store.setState(rt.moveCursor(store.getState(), dir)),
    selectChoice: (key) => store.setState(rt.selectChoice(store.getState(), key)),
    primary: () => store.setState(rt.primary(store.getState())),
    submitAnswer: () => store.setState(rt.submitAnswer(store.getState())),
    rateCard: (rating) => { store.setState(rt.rateCard(store.getState(), rating)); persistNow() },
    goHome: () => store.setState({ screen: 'home', session: null }),
    openCoverage: () => store.setState({ screen: 'coverage' }),
    openSetup: () => store.setState({ screen: 'setup' }),
    saveSyncConfig: (token, owner, repo, branch) => saveConfig({ token, owner, repo, branch }),
    runSync: () => { void runSyncAsync() },
    runSyncAsync,
    importLocalQuestions: (text) => {
      try {
        const qs = parseQuestionsFile(text)
        void saveQuestions(qs)
        store.setState({ questions: qs, screen: 'home', syncStatus: `${qs.length}問を取り込みました` })
      } catch (e) {
        store.setState({ syncStatus: '取り込み失敗: ' + (e instanceof Error ? e.message : String(e)) })
      }
    },
  }
}

function dispatchInput(store: Store, actions: Actions, a: InputAction): void {
  switch (a.type) {
    case 'move': actions.moveCursor(a.dir); break
    case 'select': actions.selectChoice(a.choice); break
    case 'primary': actions.primary(); break
    case 'back': {
      const s = store.getState()
      if (s.screen === 'quiz' && s.selected.length > 0) actions.selectChoice(s.selected[s.selected.length - 1])
      else actions.goHome()
      break
    }
    case 'rate': actions.rateCard(a.rating); break
  }
}

function render(root: HTMLElement, s: AppState, actions: Actions): void {
  root.innerHTML = ''
  const screen =
    s.screen === 'home' ? renderHome(s, actions)
    : s.screen === 'quiz' ? renderQuiz(s, actions)
    : s.screen === 'answer' ? renderAnswer(s, actions)
    : s.screen === 'setup' ? renderSetup(s, actions)
    : renderCoverage(s, actions)
  root.appendChild(screen)
}

export function mountApp(root: HTMLElement): void {
  root.textContent = 'ICU過去問SRS'
}

export async function startApp(root: HTMLElement): Promise<void> {
  const progress = (await loadProgress()) ?? initialProgress()
  const questions = (await loadQuestionsCache()) ?? []
  const store = createStore({
    questions, progress, screen: questions.length === 0 ? 'setup' : 'home', session: null,
    cursor: 0, selected: [], lastResult: null, now: new Date(), syncStatus: '',
  })
  const actions = buildActions(store, { saveProgress })
  store.subscribe((s) => render(root, s, actions))
  render(root, store.getState(), actions)

  window.addEventListener('keydown', (e) => {
    const a = mapKeyToAction(e.key, store.getState().screen)
    if (a) { e.preventDefault(); dispatchInput(store, actions, a) }
  })

  let prev: boolean[] = []
  function pollGamepads(): void {
    const pads = navigator.getGamepads?.() ?? []
    const pad = Array.from(pads).find((p) => p)
    if (pad) {
      const cur = pad.buttons.map((b) => b.pressed)
      for (const a of mapGamepadEdges(prev, cur, store.getState().screen)) dispatchInput(store, actions, a)
      prev = cur
    }
    requestAnimationFrame(pollGamepads)
  }
  requestAnimationFrame(pollGamepads)
}

if (typeof document !== 'undefined' && document.getElementById('app')) {
  const el = document.getElementById('app')
  if (el) void startApp(el)
}
