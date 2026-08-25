import { describe, expect, it } from 'vitest'
import {
  INTERVALS,
  MAX_STEP,
  applyOutcome,
  initialReviewState,
  intervalDays,
  isDue,
  outcomeFor,
  reviewPriority,
} from '../../src/engines/srs.ts'
import type { ReviewState } from '../../src/domain/types.ts'

const TODAY = 20_000

function seed(overrides: Partial<ReviewState> = {}): ReviewState {
  return { ...initialReviewState('q1'), ...overrides }
}

describe('escala d’intervals', () => {
  it('és 1, 3, 7, 14, 30, 60 dies', () => {
    expect([...INTERVALS]).toEqual([1, 3, 7, 14, 30, 60])
  })

  it('topa al màxim sense sortir del rang', () => {
    expect(intervalDays(-5)).toBe(1)
    expect(intervalDays(0)).toBe(1)
    expect(intervalDays(MAX_STEP)).toBe(60)
    expect(intervalDays(99)).toBe(60)
  })
})

describe('transicions', () => {
  it('encert amb seguretat avança un pas i programa el repàs', () => {
    const next = applyOutcome(seed(), 'correct-sure', TODAY)
    expect(next.intervalStep).toBe(1)
    expect(next.dueDay).toBe(TODAY + 3)
    expect(next.streak).toBe(1)
    expect(next.reps).toBe(1)
    expect(next.phase).toBe('review')
  })

  it('encert amb dubtes consolida però no accelera', () => {
    // Des de zero, treu la pregunta de l'inici.
    const first = applyOutcome(seed(), 'correct-unsure', TODAY)
    expect(first.intervalStep).toBe(1)

    // Des d'un pas ja avançat, es queda igual.
    const later = applyOutcome(seed({ intervalStep: 3, reps: 4 }), 'correct-unsure', TODAY)
    expect(later.intervalStep).toBe(3)
    expect(later.dueDay).toBe(TODAY + 14)
  })

  it('encertar amb dubtes no equival a encertar amb seguretat', () => {
    const base = seed({ intervalStep: 2, reps: 3 })
    const sure = applyOutcome(base, 'correct-sure', TODAY)
    const unsure = applyOutcome(base, 'correct-unsure', TODAY)
    expect(sure.intervalStep).toBeGreaterThan(unsure.intervalStep)
    expect(sure.dueDay).toBeGreaterThan(unsure.dueDay)
  })

  it('fallar retrocedeix dos passos, suma un error i trenca la ratxa', () => {
    const next = applyOutcome(seed({ intervalStep: 4, streak: 3, reps: 6 }), 'wrong', TODAY)
    expect(next.intervalStep).toBe(2)
    expect(next.lapses).toBe(1)
    expect(next.streak).toBe(0)
    expect(next.dueDay).toBe(TODAY + 7)
    expect(next.lastOutcome).toBe('wrong')
  })

  it('"No ho sé" penalitza menys que fallar', () => {
    const base = seed({ intervalStep: 4, reps: 5 })
    const wrong = applyOutcome(base, 'wrong', TODAY)
    const dontKnow = applyOutcome(base, 'dont-know', TODAY)
    expect(wrong.intervalStep).toBe(2)
    expect(dontKnow.intervalStep).toBe(3)
    // Però compta com a error d'aprenentatge.
    expect(dontKnow.lapses).toBe(1)
    expect(dontKnow.streak).toBe(0)
  })

  it('mai baixa per sota del pas zero', () => {
    const next = applyOutcome(seed({ intervalStep: 1 }), 'wrong', TODAY)
    expect(next.intervalStep).toBe(0)
    expect(next.phase).toBe('learning')
    expect(next.dueDay).toBe(TODAY + 1)
  })

  it('arriba a "mastered" amb pas alt i ratxa de dos encerts segurs', () => {
    let s = seed({ intervalStep: 3, reps: 5 })
    s = applyOutcome(s, 'correct-sure', TODAY) // step 4, streak 1 → review
    expect(s.phase).toBe('review')
    s = applyOutcome(s, 'correct-sure', TODAY + 30) // step 5, streak 2 → mastered
    expect(s.phase).toBe('mastered')
    expect(s.intervalStep).toBe(5)
    expect(s.dueDay).toBe(TODAY + 30 + 60)
  })

  it('perd "mastered" en fallar', () => {
    const mastered = seed({ intervalStep: 5, streak: 4, phase: 'mastered', reps: 9 })
    const next = applyOutcome(mastered, 'wrong', TODAY)
    expect(next.phase).toBe('review')
    expect(next.intervalStep).toBe(3)
  })

  it('un encert segur treu la marca de "repassar després"', () => {
    const flagged = seed({ flagged: true, intervalStep: 1, reps: 2 })
    expect(applyOutcome(flagged, 'correct-sure', TODAY).flagged).toBe(false)
    expect(applyOutcome(flagged, 'wrong', TODAY).flagged).toBe(true)
    expect(applyOutcome(flagged, 'correct-unsure', TODAY).flagged).toBe(true)
  })

  it('no muta l’estat original', () => {
    const base = seed({ intervalStep: 2, reps: 3 })
    const snapshot = { ...base }
    applyOutcome(base, 'wrong', TODAY)
    expect(base).toEqual(snapshot)
  })
})

describe('venciment i prioritat', () => {
  it('una pregunta mai vista no compta com a vençuda', () => {
    expect(isDue(seed(), TODAY)).toBe(false)
  })

  it('venç quan arriba el dia programat', () => {
    const s = seed({ reps: 1, dueDay: TODAY })
    expect(isDue(s, TODAY)).toBe(true)
    expect(isDue(s, TODAY - 1)).toBe(false)
    expect(isDue(s, TODAY + 5)).toBe(true)
  })

  it('prioritza el retard, després els errors i el marcatge manual', () => {
    const old = seed({ reps: 3, dueDay: TODAY - 10 })
    const recent = seed({ reps: 3, dueDay: TODAY })
    expect(reviewPriority(old, TODAY)).toBeGreaterThan(reviewPriority(recent, TODAY))

    const withLapses = seed({ reps: 3, dueDay: TODAY, lapses: 4 })
    expect(reviewPriority(withLapses, TODAY)).toBe(20)

    const flagged = seed({ reps: 3, dueDay: TODAY, flagged: true })
    expect(reviewPriority(flagged, TODAY)).toBe(25)
  })
})

describe('outcomeFor', () => {
  it('tradueix la resposta d’estudi al resultat de repàs', () => {
    expect(outcomeFor(true, false, 'sure')).toBe('correct-sure')
    expect(outcomeFor(true, false, 'unsure')).toBe('correct-unsure')
    expect(outcomeFor(true, false, null)).toBe('correct-sure')
    expect(outcomeFor(false, false, 'sure')).toBe('wrong')
    // "No ho sé" té prioritat sobre qualsevol altra cosa.
    expect(outcomeFor(false, true, 'sure')).toBe('dont-know')
    expect(outcomeFor(true, true, 'sure')).toBe('dont-know')
  })
})
