/** Utilitats de dates basades en "dies epoch" (dies sencers des de 1970-01-01). */

const MS_PER_DAY = 86_400_000

/** Converteix un instant en el seu dia epoch en hora local. */
export function toEpochDay(ms: number): number {
  const d = new Date(ms)
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY,
  )
}

/** Dia epoch d'una data ISO curta (YYYY-MM-DD). */
export function isoToEpochDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return Math.floor(Date.UTC(y, m - 1, d) / MS_PER_DAY)
}

/** Data ISO curta a partir d'un dia epoch. */
export function epochDayToIso(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10)
}

/** Dies que falten entre dos dies epoch (pot ser negatiu). */
export function daysBetween(from: number, to: number): number {
  return to - from
}

/** Format humà curt d'una durada en mil·lisegons: "12:05". */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format llarg: "1 h 12 min" / "12 min". */
export function formatDuration(ms: number, lang: 'ca' | 'es' = 'ca'): string {
  const min = Math.round(ms / 60_000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const rest = min % 60
  const hLabel = lang === 'ca' ? 'h' : 'h'
  return rest === 0 ? `${h} ${hLabel}` : `${h} ${hLabel} ${rest} min`
}
