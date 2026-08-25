import { describe, expect, it } from 'vitest'
import {
  CONEIXEMENTS_SCORING,
  CULTURA_GENERAL_SCORING,
  combineBreakdowns,
  formatMilli,
  scoreExam,
  type ScoredItem,
} from '../../src/engines/scoring.ts'

/** Construeix n respostes del tipus demanat. */
function items(
  spec: { correct?: number; wrong?: number; blank?: number; reserve?: number; annulled?: number },
): ScoredItem[] {
  const out: ScoredItem[] = []
  for (let i = 0; i < (spec.correct ?? 0); i++) out.push({ chosen: 'a', correct: 'a' })
  for (let i = 0; i < (spec.wrong ?? 0); i++) out.push({ chosen: 'b', correct: 'a' })
  for (let i = 0; i < (spec.blank ?? 0); i++) out.push({ chosen: null, correct: 'a' })
  for (let i = 0; i < (spec.reserve ?? 0); i++) out.push({ chosen: 'b', correct: 'a', reserve: true })
  for (let i = 0; i < (spec.annulled ?? 0); i++) out.push({ chosen: 'b', correct: 'a', annulled: true })
  return out
}

describe('cultura general (+1 / −0,25 / 0, sobre 20, apte ≥ 10)', () => {
  it('puntua un examen perfecte amb 20 punts', () => {
    const r = scoreExam(items({ correct: 20 }), CULTURA_GENERAL_SCORING)
    expect(r.scoreMilli).toBe(20_000)
    expect(r.passed).toBe(true)
    expect(formatMilli(r.scoreMilli)).toBe('20')
  })

  it('resta 0,25 per cada error', () => {
    const r = scoreExam(items({ correct: 12, wrong: 8 }), CULTURA_GENERAL_SCORING)
    // 12 − (8 × 0,25) = 12 − 2 = 10
    expect(r.rawMilli).toBe(12_000)
    expect(r.penaltyMilli).toBe(2_000)
    expect(r.scoreMilli).toBe(10_000)
    expect(formatMilli(r.scoreMilli)).toBe('10')
  })

  it('no penalitza les preguntes en blanc', () => {
    const withBlanks = scoreExam(items({ correct: 10, blank: 10 }), CULTURA_GENERAL_SCORING)
    const withWrong = scoreExam(items({ correct: 10, wrong: 10 }), CULTURA_GENERAL_SCORING)
    expect(withBlanks.scoreMilli).toBe(10_000)
    expect(withWrong.scoreMilli).toBe(7_500)
    expect(withBlanks.blank).toBe(10)
  })

  it('marca el límit exacte d’aprovat: 10,000 aprova i 9,750 no', () => {
    // 12 encerts i 8 errors = exactament 10
    expect(scoreExam(items({ correct: 12, wrong: 8 }), CULTURA_GENERAL_SCORING).passed).toBe(true)
    // 11 encerts, 8 errors, 1 en blanc = 11 − 2 = 9
    const just = scoreExam(items({ correct: 11, wrong: 8, blank: 1 }), CULTURA_GENERAL_SCORING)
    expect(just.scoreMilli).toBe(9_000)
    expect(just.passed).toBe(false)
    // 11 encerts i 4 errors = 11 − 1 = 10 → aprova
    expect(scoreExam(items({ correct: 11, wrong: 4, blank: 5 }), CULTURA_GENERAL_SCORING).passed).toBe(true)
  })

  it('permet resultat negatiu però mostra 0 com a mínim', () => {
    const r = scoreExam(items({ wrong: 20 }), CULTURA_GENERAL_SCORING)
    expect(r.scoreMilli).toBe(-5_000)
    expect(r.displayMilli).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('exclou les preguntes de reserva del còmput', () => {
    const r = scoreExam(items({ correct: 20, reserve: 1 }), CULTURA_GENERAL_SCORING)
    expect(r.counted).toBe(20)
    expect(r.reserved).toBe(1)
    expect(r.scoreMilli).toBe(20_000)
  })

  it('exclou les preguntes anul·lades pel tribunal', () => {
    const r = scoreExam(items({ correct: 19, annulled: 1 }), CULTURA_GENERAL_SCORING)
    expect(r.counted).toBe(19)
    expect(r.annulled).toBe(1)
    expect(r.scoreMilli).toBe(19_000)
  })
})

describe('coneixements professionals (+0,5 / −0,125 / 0, sobre 20, apte ≥ 10)', () => {
  it('puntua un examen perfecte amb 20 punts', () => {
    const r = scoreExam(items({ correct: 40 }), CONEIXEMENTS_SCORING)
    expect(r.scoreMilli).toBe(20_000)
    expect(r.passed).toBe(true)
  })

  it('calcula la penalització sense error de coma flotant', () => {
    // 8 errors × 0,125 = 1 punt exacte. Amb floats, 8 × 0.125 és exacte,
    // però 3 × 0,125 = 0,375 i 0,1+0,2 no ho és: el test cobreix un cas dur.
    const r = scoreExam(items({ correct: 25, wrong: 3, blank: 12 }), CONEIXEMENTS_SCORING)
    expect(r.rawMilli).toBe(12_500)
    expect(r.penaltyMilli).toBe(375)
    expect(r.scoreMilli).toBe(12_125)
    expect(formatMilli(r.scoreMilli)).toBe('12,125')
  })

  it('marca el límit exacte d’aprovat', () => {
    // 21 encerts (10,5) i 4 errors (−0,5) = 10,000 exacte → aprova
    const exact = scoreExam(items({ correct: 21, wrong: 4, blank: 15 }), CONEIXEMENTS_SCORING)
    expect(exact.scoreMilli).toBe(10_000)
    expect(exact.passed).toBe(true)

    // Un error més: 10,5 − 0,625 = 9,875 → no aprova
    const below = scoreExam(items({ correct: 21, wrong: 5, blank: 14 }), CONEIXEMENTS_SCORING)
    expect(below.scoreMilli).toBe(9_875)
    expect(below.passed).toBe(false)
  })

  it('accepta les 2 preguntes de reserva sense computar-les', () => {
    const r = scoreExam(items({ correct: 40, reserve: 2 }), CONEIXEMENTS_SCORING)
    expect(r.counted).toBe(40)
    expect(r.reserved).toBe(2)
    expect(r.scoreMilli).toBe(20_000)
  })
})

describe('simulacre complet', () => {
  it('agrega les dues proves i només aprova si aproven totes dues', () => {
    const cg = scoreExam(items({ correct: 15, wrong: 5 }), CULTURA_GENERAL_SCORING) // 13,75
    const cp = scoreExam(items({ correct: 15, wrong: 25 }), CONEIXEMENTS_SCORING) // 7,5 − 3,125 = 4,375
    expect(cg.passed).toBe(true)
    expect(cp.passed).toBe(false)

    const total = combineBreakdowns([cg, cp])
    expect(total.counted).toBe(60)
    expect(total.maxScoreMilli).toBe(40_000)
    expect(total.passed).toBe(false)
    expect(total.scoreMilli).toBe(cg.scoreMilli + cp.scoreMilli)
  })
})

describe('formatMilli', () => {
  it('retalla zeros finals i fa servir coma decimal', () => {
    expect(formatMilli(12_500)).toBe('12,5')
    expect(formatMilli(12_125)).toBe('12,125')
    expect(formatMilli(9_875)).toBe('9,875')
    expect(formatMilli(20_000)).toBe('20')
    expect(formatMilli(0)).toBe('0')
    expect(formatMilli(-5_000)).toBe('−5')
  })
})
