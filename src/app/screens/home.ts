import type { AppState, Actions } from '../types'
import { buildDailyQueue, remainingNewCount } from '../../core/session'
import { paceForecast } from '../../core/pacing'

export function coverageByYear(s: AppState): { year: number; total: number; seen: number; review: number }[] {
  const years = [...new Set(s.questions.map((q) => q.year))].sort((a, b) => a - b)
  return years.map((year) => {
    const inYear = s.questions.filter((q) => q.year === year)
    const seen = inYear.filter((q) => q.id in s.progress.cards)
    const review = seen.filter((q) => s.progress.cards[q.id].state === 2)
    return { year, total: inYear.length, seen: seen.length, review: review.length }
  })
}

export function renderHome(s: AppState, actions: Actions): HTMLElement {
  const root = document.createElement('div')
  root.className = 'screen home'

  const { reviews, news } = buildDailyQueue(s.questions, s.progress, s.now)
  const count = document.createElement('p')
  count.className = 'today-count'
  count.textContent = `今日の問題: ${reviews.length + news.length} 問（復習 ${reviews.length} / 新規 ${news.length}）`
  root.appendChild(count)

  const forecast = paceForecast(remainingNewCount(s.questions, s.progress), s.now, s.progress.settings)
  const pace = document.createElement('p')
  pace.className = 'pace'
  const label = forecast.status === 'done' ? '新規は完了' : forecast.status === 'onTrack' ? '予定どおり' : '遅れ気味'
  pace.textContent = `ペース: 1日 ${forecast.perDay} 問・新規完了予定 ${forecast.finishProjected}（${label}）`
  root.appendChild(pace)

  const start = document.createElement('button')
  start.className = 'start'
  start.textContent = '今日の問題を始める'
  start.addEventListener('click', () => actions.startSession())
  root.appendChild(start)

  const toCov = document.createElement('button')
  toCov.className = 'to-coverage'
  toCov.textContent = '網羅マップ'
  toCov.addEventListener('click', () => actions.openCoverage())
  root.appendChild(toCov)

  const sync = document.createElement('button')
  sync.className = 'sync'
  sync.textContent = '🔄 同期'
  sync.addEventListener('click', () => actions.runSync())
  root.appendChild(sync)

  const setupBtn = document.createElement('button')
  setupBtn.className = 'to-setup'
  setupBtn.textContent = '同期の設定'
  setupBtn.addEventListener('click', () => actions.openSetup())
  root.appendChild(setupBtn)

  if (s.syncStatus) {
    const st = document.createElement('p')
    st.className = 'sync-status'
    st.textContent = s.syncStatus
    root.appendChild(st)
  }

  return root
}
