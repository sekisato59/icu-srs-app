import type { Settings } from './types'

const MS_PER_DAY = 86_400_000

// Config strings 'YYYY-MM-DD' → UTC noon of that calendar date.
// Using noon (12:00 UTC) ensures local-calendar getters (.getDate() etc.) return the
// correct calendar day in any UTC offset from -12 to +14.
function ymdToUTCNoon(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

// A moment-in-time → UTC midnight of the user's LOCAL calendar day.
// Uses local getters so "today" (new Date()) resolves to the user's local date,
// then pins to UTC midnight so all downstream diffs are exact integer days.
function toCalendarUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((toCalendarUTC(to).getTime() - toCalendarUTC(from).getTime()) / MS_PER_DAY)
}

export function newCardDeadline(settings: Settings): Date {
  // Subtract buffer in whole days from the finishBy noon-UTC anchor.
  // The noon UTC anchor keeps local-calendar getters correct in any timezone
  // (UTC-12 to UTC+14). .toISOString().slice(0,10) still returns the right date.
  return new Date(ymdToUTCNoon(settings.finishBy).getTime() - settings.newCardDeadlineBufferDays * MS_PER_DAY)
}

export function dailyNewCount(remainingNew: number, today: Date, settings: Settings): number {
  if (settings.newPerDayOverride !== null) return settings.newPerDayOverride
  if (remainingNew <= 0) return 0
  const daysLeft = daysBetween(today, newCardDeadline(settings))
  if (daysLeft <= 0) return remainingNew
  return Math.ceil(remainingNew / daysLeft)
}

export function paceForecast(remainingNew: number, today: Date, settings: Settings) {
  // Pin "today" to UTC midnight of the user's local calendar day for all projections.
  const todayUTC = toCalendarUTC(today)
  if (remainingNew <= 0) {
    return { perDay: 0, finishProjected: todayUTC.toISOString().slice(0, 10), status: 'done' as const }
  }
  const perDay = dailyNewCount(remainingNew, today, settings)
  const daysNeeded = Math.ceil(remainingNew / Math.max(1, perDay))
  const projected = new Date(todayUTC.getTime() + daysNeeded * MS_PER_DAY)
  const deadline = newCardDeadline(settings)
  const status = toCalendarUTC(projected).getTime() <= toCalendarUTC(deadline).getTime() ? ('onTrack' as const) : ('behind' as const)
  return { perDay, finishProjected: projected.toISOString().slice(0, 10), status }
}
