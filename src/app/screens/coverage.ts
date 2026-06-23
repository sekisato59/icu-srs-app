import type { AppState, Actions } from '../types'
import { coverageByYear } from './home'

export function renderCoverage(s: AppState, actions: Actions): HTMLElement {
  const root = document.createElement('div')
  root.className = 'screen coverage'

  const title = document.createElement('h2')
  title.textContent = '網羅マップ（年度別）'
  root.appendChild(title)

  for (const row of coverageByYear(s)) {
    const div = document.createElement('div')
    div.className = 'cov-row'
    div.dataset.year = String(row.year)
    const pct = row.total === 0 ? 0 : Math.round((row.seen / row.total) * 100)
    div.textContent = `${row.year}年度: ${row.seen}/${row.total} 着手（復習段階 ${row.review}）— ${pct}%`
    root.appendChild(div)
  }

  const back = document.createElement('button')
  back.className = 'back'
  back.textContent = '戻る'
  back.addEventListener('click', () => actions.goHome())
  root.appendChild(back)
  return root
}
