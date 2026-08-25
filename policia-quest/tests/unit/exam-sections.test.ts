/**
 * Mecànica del simulacre multisecció.
 *
 * El simulacre complet encadena cultura general i coneixements professionals,
 * cadascuna amb el seu temps i les seves regles. Mentre el paquet d'actualitat
 * estigui buit, aquest simulacre queda bloquejat i el recorregut d'extrem a
 * extrem no es pot executar (vegeu `tests/e2e/flows.spec.ts`). Aquests tests
 * cobreixen la mateixa aritmètica sense passar per la interfície, de manera que
 * la màquina no queda sense xarxa mentre duri el bloqueig.
 */
import { describe, expect, it } from 'vitest'
import { sectionOffsets } from '../../src/screens/ExamRunner.tsx'
import { scoreExam, type ScoredItem } from '../../src/engines/scoring.ts'
import { CONEIXEMENTS_SCORING, CULTURA_GENERAL_SCORING } from '../../src/engines/scoring.ts'
import { migrateExamAttempt } from '../../src/persistence/migrations.ts'

describe('índexs de les seccions', () => {
  it('cada secció comença on acaba l’anterior', () => {
    // 20 + 1 de reserva, i després 40 + 2.
    expect(sectionOffsets([{ count: 21 }, { count: 42 }])).toEqual([0, 21])
  })

  it('una sola secció comença a zero', () => {
    expect(sectionOffsets([{ count: 42 }])).toEqual([0])
  })

  it('sense seccions no hi ha cap índex', () => {
    expect(sectionOffsets([])).toEqual([])
  })
})

describe('puntuació per seccions', () => {
  /** Un quadernet de `n` respostes, `correct` de les quals encertades. */
  const items = (n: number, correct: number, reserve = 0): ScoredItem[] =>
    Array.from({ length: n }, (_, i) => ({
      chosen: i < correct ? 'a' : 'b',
      correct: 'a' as const,
      ...(i >= n - reserve ? { reserve: true } : {}),
    }))

  it('cada prova es puntua amb les seves regles, no amb una de comuna', () => {
    // 12 encerts i 8 errors a cultura general: 12 − 8×0,25 = 10.
    const cg = scoreExam(items(20, 12), CULTURA_GENERAL_SCORING)
    expect(cg.scoreMilli).toBe(10_000)
    expect(cg.passed).toBe(true)

    // Els mateixos 12 encerts sobre 40 a professionals no arriben a 10.
    const cp = scoreExam(items(40, 12), CONEIXEMENTS_SCORING)
    expect(cp.scoreMilli).toBe(12 * 500 - 28 * 125)
    expect(cp.passed).toBe(false)
  })

  it('el veredicte del complet exigeix aprovar les dues, no fer-ne mitjana', () => {
    const cg = scoreExam(items(20, 20), CULTURA_GENERAL_SCORING) // 20/20
    const cp = scoreExam(items(40, 12), CONEIXEMENTS_SCORING) // suspesa
    // Una mitjana donaria per aprovat el conjunt; el veredicte real, no.
    const mitjana = (cg.scoreMilli + cp.scoreMilli) / 2
    expect(mitjana).toBeGreaterThanOrEqual(10_000)
    expect(cg.passed && cp.passed).toBe(false)
  })

  it('les reserves queden fora del càlcul de totes dues proves', () => {
    const amb = scoreExam(items(21, 10, 1), CULTURA_GENERAL_SCORING)
    const sense = scoreExam(items(20, 10), CULTURA_GENERAL_SCORING)
    expect(amb.counted).toBe(20)
    expect(amb.reserved).toBe(1)
    expect(amb.scoreMilli).toBe(sense.scoreMilli)
  })
})

describe('migració d’intents antics', () => {
  it('un intent sense seccions en deriva una de sola', () => {
    const migrated = migrateExamAttempt({
      attemptId: 'a1',
      blueprintIds: ['roses-coneixements-professionals'],
      questionIds: ['q1', 'q2', 'q3'],
      responses: ['a', null, 'c'],
      flagged: [false, false, false],
      startedAt: 1,
      durationMs: 3_600_000,
      elapsedMsAtPause: 1000,
      status: 'in-progress',
      currentIndex: 1,
    })
    expect(migrated?.sections).toHaveLength(1)
    expect(migrated?.sections[0]?.count).toBe(3)
    // Els intents d'abans de les reserves no en tenien cap: es puntuen sencers.
    expect(migrated?.sections[0]?.reserveCount).toBe(0)
  })

  it('un intent amb seccions les conserva, reserves incloses', () => {
    const migrated = migrateExamAttempt({
      attemptId: 'a2',
      blueprintIds: ['roses-cultura-general', 'roses-coneixements-professionals'],
      questionIds: Array.from({ length: 63 }, (_, i) => `q${i}`),
      responses: Array.from({ length: 63 }, () => null),
      flagged: Array.from({ length: 63 }, () => false),
      startedAt: 1,
      durationMs: 4_800_000,
      elapsedMsAtPause: 0,
      status: 'in-progress',
      currentIndex: 0,
      sections: [
        { blueprintId: 'roses-cultura-general', count: 21, reserveCount: 1, durationMs: 1_200_000, elapsedMs: 0, finished: false },
        { blueprintId: 'roses-coneixements-professionals', count: 42, reserveCount: 2, durationMs: 3_600_000, elapsedMs: 0, finished: false },
      ],
    })
    expect(migrated?.sections).toHaveLength(2)
    expect(sectionOffsets(migrated!.sections)).toEqual([0, 21])
    expect(migrated?.sections[1]?.reserveCount).toBe(2)
  })
})
