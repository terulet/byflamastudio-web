/**
 * Motor de puntuació dels simulacres de Roses.
 *
 * Tots els càlculs es fan en **mil·lipunts** (enters). Mai es fan servir
 * decimals intermedis: 0,25 punts de penalització són 250 mil·lipunts. Això
 * elimina qualsevol error de coma flotant (per exemple 3 × 0,1 !== 0,3).
 *
 * Regles vigents segons les bases de Roses (roses-bases-2026-interins):
 *
 *  Cultura general           20 preguntes · 20 min · +1 / −0,25 / 0 · sobre 20 · apte ≥ 10
 *  Coneixements professionals 40 preguntes · 60 min · +0,5 / −0,125 / 0 · sobre 20 · apte ≥ 10
 */
import type { ScoringRules } from '../domain/types.ts'

export const MILLI = 1000

/** Regles de la prova de cultura general. */
export const CULTURA_GENERAL_SCORING: ScoringRules = {
  correctMilli: 1000, // +1,000
  wrongMilli: 250, // −0,250
  blankMilli: 0,
  maxScoreMilli: 20_000, // sobre 20
  passMarkMilli: 10_000, // apte a partir de 10
}

/** Regles de la prova de coneixements professionals. */
export const CONEIXEMENTS_SCORING: ScoringRules = {
  correctMilli: 500, // +0,500
  wrongMilli: 125, // −0,125
  blankMilli: 0,
  maxScoreMilli: 20_000,
  passMarkMilli: 10_000,
}

export interface ScoredItem {
  /** Resposta triada; `null` significa en blanc. */
  chosen: 'a' | 'b' | 'c' | 'd' | null
  correct: 'a' | 'b' | 'c' | 'd'
  /** Les preguntes de reserva no puntuen si no substitueixen cap altra. */
  reserve?: boolean
  /** Una pregunta anul·lada pel tribunal no resta ni suma. */
  annulled?: boolean
}

export interface ScoreBreakdown {
  /** Preguntes que han entrat al càlcul (exclou reserves i anul·lades). */
  counted: number
  correct: number
  wrong: number
  blank: number
  /** Preguntes de reserva no computades. */
  reserved: number
  /** Preguntes anul·lades no computades. */
  annulled: number
  /** Punts bruts pels encerts, en mil·lipunts. */
  rawMilli: number
  /** Penalització total (positiva), en mil·lipunts. */
  penaltyMilli: number
  /** Resultat net, en mil·lipunts. Pot ser negatiu. */
  scoreMilli: number
  /** Resultat net amb terra a 0, que és el que es mostra. */
  displayMilli: number
  maxScoreMilli: number
  passMarkMilli: number
  passed: boolean
}

/**
 * Puntua una llista de respostes segons unes regles.
 *
 * Les preguntes de reserva i les anul·lades s'exclouen del còmput però es
 * compten a part perquè el desglossament sigui honest.
 */
export function scoreExam(items: readonly ScoredItem[], rules: ScoringRules): ScoreBreakdown {
  let correct = 0
  let wrong = 0
  let blank = 0
  let reserved = 0
  let annulled = 0

  for (const item of items) {
    if (item.reserve) {
      reserved++
      continue
    }
    if (item.annulled) {
      annulled++
      continue
    }
    if (item.chosen === null) blank++
    else if (item.chosen === item.correct) correct++
    else wrong++
  }

  const counted = correct + wrong + blank
  const rawMilli = correct * rules.correctMilli + blank * rules.blankMilli
  const penaltyMilli = wrong * rules.wrongMilli
  const scoreMilli = rawMilli - penaltyMilli
  const displayMilli = Math.max(0, scoreMilli)

  return {
    counted,
    correct,
    wrong,
    blank,
    reserved,
    annulled,
    rawMilli,
    penaltyMilli,
    scoreMilli,
    displayMilli,
    maxScoreMilli: rules.maxScoreMilli,
    passMarkMilli: rules.passMarkMilli,
    // L'aprovat es mesura sobre el resultat net real, no sobre el mostrat.
    passed: scoreMilli >= rules.passMarkMilli,
  }
}

/**
 * Combina dos desglossaments (simulacre complet: cultura general + professional).
 * Cada prova es puntua amb les seves regles i el resultat es reporta per separat;
 * aquesta funció només agrega els totals informatius.
 */
export function combineBreakdowns(parts: readonly ScoreBreakdown[]): ScoreBreakdown {
  const zero: ScoreBreakdown = {
    counted: 0, correct: 0, wrong: 0, blank: 0, reserved: 0, annulled: 0,
    rawMilli: 0, penaltyMilli: 0, scoreMilli: 0, displayMilli: 0,
    maxScoreMilli: 0, passMarkMilli: 0, passed: true,
  }
  return parts.reduce<ScoreBreakdown>((acc, p) => ({
    counted: acc.counted + p.counted,
    correct: acc.correct + p.correct,
    wrong: acc.wrong + p.wrong,
    blank: acc.blank + p.blank,
    reserved: acc.reserved + p.reserved,
    annulled: acc.annulled + p.annulled,
    rawMilli: acc.rawMilli + p.rawMilli,
    penaltyMilli: acc.penaltyMilli + p.penaltyMilli,
    scoreMilli: acc.scoreMilli + p.scoreMilli,
    displayMilli: acc.displayMilli + p.displayMilli,
    maxScoreMilli: acc.maxScoreMilli + p.maxScoreMilli,
    passMarkMilli: acc.passMarkMilli + p.passMarkMilli,
    passed: acc.passed && p.passed,
  }), zero)
}

/** Formata mil·lipunts com a nota amb tres decimals significatius: "12,375". */
export function formatMilli(milli: number, lang: 'ca' | 'es' = 'ca'): string {
  const sign = milli < 0 ? '−' : ''
  const abs = Math.abs(milli)
  const whole = Math.floor(abs / MILLI)
  const frac = abs % MILLI
  const sep = lang === 'ca' || lang === 'es' ? ',' : '.'
  if (frac === 0) return `${sign}${whole}`
  // Retallem els zeros finals: 12,500 → 12,5 ; 12,375 → 12,375
  const fracText = String(frac).padStart(3, '0').replace(/0+$/, '')
  return `${sign}${whole}${sep}${fracText}`
}
