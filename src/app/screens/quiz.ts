import type { AppState, Actions } from '../types'
import { currentQuestion } from '../session-runtime'

export function renderQuiz(s: AppState, actions: Actions): HTMLElement {
  const root = document.createElement('div')
  root.className = 'screen quiz'
  const q = currentQuestion(s)
  if (!q) { root.textContent = '問題がありません'; return root }

  const stem = document.createElement('p')
  stem.className = 'stem'
  stem.textContent = q.stem
  root.appendChild(stem)

  if (q.needsImage) {
    const note = document.createElement('p')
    note.className = 'image-note'
    note.textContent = '※この問題は画像が必要です（画像は今後追加されます）'
    root.appendChild(note)
  }

  const list = document.createElement('div')
  list.className = 'choices'
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button')
    btn.className = 'choice' + (s.selected.includes(c.key) ? ' selected' : '') + (i === s.cursor ? ' cursor' : '')
    btn.dataset.key = c.key
    btn.textContent = `${c.key}. ${c.text}`
    btn.addEventListener('click', () => actions.selectChoice(c.key))
    list.appendChild(btn)
  })
  root.appendChild(list)

  if (q.selectCount > 1) {
    const submit = document.createElement('button')
    submit.className = 'submit'
    submit.textContent = `決定（${s.selected.length}/${q.selectCount}）`
    submit.disabled = s.selected.length !== q.selectCount
    submit.addEventListener('click', () => actions.submitAnswer())
    root.appendChild(submit)
  }
  return root
}
