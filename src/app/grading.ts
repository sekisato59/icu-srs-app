export function isAnswerCorrect(selected: string[], correct: string[]): boolean {
  if (selected.length !== correct.length) return false
  const c = new Set(correct)
  return selected.every((s) => c.has(s))
}
