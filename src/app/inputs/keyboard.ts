import type { InputAction, Screen } from '../types'

const LETTERS = ['a', 'b', 'c', 'd', 'e']

export function mapKeyToAction(key: string, screen: Screen): InputAction | null {
  if (screen === 'quiz') {
    if (LETTERS.includes(key.toLowerCase())) return { type: 'select', choice: key.toLowerCase() }
    if (key >= '1' && key <= '5') return { type: 'select', choice: LETTERS[Number(key) - 1] }
    if (key === 'Enter') return { type: 'primary' }
    if (key === 'Backspace') return { type: 'back' }
    if (key === 'ArrowUp') return { type: 'move', dir: -1 }
    if (key === 'ArrowDown') return { type: 'move', dir: 1 }
    return null
  }
  if (screen === 'answer') {
    if (key >= '1' && key <= '4') return { type: 'rate', rating: Number(key) as 1 | 2 | 3 | 4 }
    return null
  }
  return null
}
