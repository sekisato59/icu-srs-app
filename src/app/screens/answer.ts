import type { AppState, Actions } from '../types'
import { currentQuestion } from '../session-runtime'

const RATES: { rating: 1 | 2 | 3 | 4; label: string }[] = [
  { rating: 1, label: '× もう一度' },
  { rating: 2, label: '□ 難しい' },
  { rating: 3, label: '△ ふつう' },
  { rating: 4, label: '○ 簡単' },
]

export function renderAnswer(s: AppState, actions: Actions): HTMLElement {
  const root = document.createElement('div')
  root.className = 'screen answer'
  const q = currentQuestion(s)
  if (!q || !s.lastResult) { root.textContent = '—'; return root }

  const verdict = document.createElement('p')
  verdict.className = s.lastResult.correct ? 'correct' : 'incorrect'
  verdict.textContent = s.lastResult.correct ? '正解' : '不正解'
  root.appendChild(verdict)

  const ans = document.createElement('p')
  ans.className = 'answer-keys'
  ans.textContent = '正答: ' + q.correct.join(', ')
  root.appendChild(ans)

  const exp = document.createElement('p')
  exp.className = 'explanation'
  exp.textContent = q.enrichedExplanation?.summary || q.originalExplanation || ''
  root.appendChild(exp)

  if (q.citations.length > 0) {
    const cite = document.createElement('p')
    cite.className = 'citation'
    cite.textContent = '出典: ' + q.citations.map((c) => `${c.source} p.${c.page ?? '?'}`).join(' / ')
    root.appendChild(cite)
  }

  const rates = document.createElement('div')
  rates.className = 'rates'
  for (const r of RATES) {
    const btn = document.createElement('button')
    btn.className = 'rate'
    btn.dataset.rating = String(r.rating)
    btn.textContent = r.label
    btn.addEventListener('click', () => actions.rateCard(r.rating))
    rates.appendChild(btn)
  }
  root.appendChild(rates)
  return root
}
