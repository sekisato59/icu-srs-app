import type { AppState, Actions } from '../types'

function field(label: string, cls: string, value = '', type = 'text'): HTMLElement {
  const wrap = document.createElement('label')
  wrap.className = 'field'
  wrap.textContent = label
  const input = document.createElement('input')
  input.className = cls
  input.type = type
  input.value = value
  wrap.appendChild(input)
  return wrap
}

export function renderSetup(s: AppState, actions: Actions): HTMLElement {
  const root = document.createElement('div')
  root.className = 'screen setup'

  const title = document.createElement('h2')
  title.textContent = '同期の設定'
  root.appendChild(title)

  root.appendChild(field('GitHub トークン', 'f-token', '', 'password'))
  root.appendChild(field('ユーザー名 (owner)', 'f-owner'))
  root.appendChild(field('データ用リポジトリ名', 'f-repo', 'icu-srs-data'))
  root.appendChild(field('ブランチ', 'f-branch', 'main'))

  const save = document.createElement('button')
  save.className = 'save-sync'
  save.textContent = '保存して同期'
  save.addEventListener('click', () => {
    const get = (c: string) => (root.querySelector('.' + c) as HTMLInputElement).value.trim()
    actions.saveSyncConfig(get('f-token'), get('f-owner'), get('f-repo'), get('f-branch'))
    actions.runSync()
  })
  root.appendChild(save)

  const sep = document.createElement('p')
  sep.className = 'or-local'
  sep.textContent = 'または、手元の questions.json を取り込む:'
  root.appendChild(sep)

  const file = document.createElement('input')
  file.className = 'local-file'
  file.type = 'file'
  file.accept = 'application/json,.json'
  file.addEventListener('change', () => {
    const f = file.files?.[0]
    if (!f) return
    f.text().then((txt) => actions.importLocalQuestions(txt))
  })
  root.appendChild(file)

  const status = document.createElement('p')
  status.className = 'sync-status'
  status.textContent = s.syncStatus
  root.appendChild(status)

  return root
}
