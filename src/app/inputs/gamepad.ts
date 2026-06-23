import type { InputAction, Screen } from '../types'

export function mapGamepadEdges(prev: boolean[], cur: boolean[], screen: Screen): InputAction[] {
  const pressed = (i: number) => cur[i] === true && prev[i] !== true
  const out: InputAction[] = []
  if (screen === 'quiz') {
    if (pressed(12) || pressed(14)) out.push({ type: 'move', dir: -1 })
    if (pressed(13) || pressed(15)) out.push({ type: 'move', dir: 1 })
    if (pressed(1)) out.push({ type: 'primary' })
    if (pressed(0)) out.push({ type: 'back' })
  } else if (screen === 'answer') {
    if (pressed(0)) out.push({ type: 'rate', rating: 1 })
    if (pressed(2)) out.push({ type: 'rate', rating: 2 })
    if (pressed(3)) out.push({ type: 'rate', rating: 3 })
    if (pressed(1)) out.push({ type: 'rate', rating: 4 })
  }
  return out
}
