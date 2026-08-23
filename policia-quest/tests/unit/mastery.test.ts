import { describe, expect, it } from 'vitest'
import {
  MIN_ANSWERS_FOR_MASTERY,
  bandFor,
  computeTopicMastery,
  globalMastery,
  questionStrength,
} from '../../src/engines/mastery.ts'
import { initialReviewState } from '../../src/engines/srs.ts'
import type { AnswerRecord, ReviewState } from '../../src/domain/types.ts'

const TODAY = 20_000

function state(id: string, patch: Partial<ReviewState>): ReviewState {
  return { ...initialReviewState(id), ...patch }
}

function answers(correctCount: number, wrongCount: number): AnswerRecord[] {
  const out: AnswerRecord[] = []
  for (let i = 0; i < correctCount; i++) {
    out.push({
      questionId: `c${i}`, topicId: 'roses-t01', chosen: 'a', correct: true,
      dontKnow: false, confidence: 'sure', msSpent: 5_000, answeredAt: i,
    })
  }
  for (let i = 0; i < wrongCount; i++) {
    out.push({
      questionId: `w${i}`, topicId: 'roses-t01', chosen: 'b', correct: false,
      dontKnow: false, confidence: 'unsure', msSpent: 5_000, answeredAt: 100 + i,
    })
  }
  return out
}

describe('força individual', () => {
  it('una pregunta mai vista val zero', () => {
    expect(questionStrength(undefined)).toBe(0)
    expect(questionStrength(state('q', { reps: 0, intervalStep: 3 }))).toBe(0)
  })

  it('creix amb l’interval, la ratxa i la seguretat', () => {
    const low = questionStrength(state('q', { reps: 1, intervalStep: 1 }))
    const mid = questionStrength(state('q', { reps: 3, intervalStep: 3, streak: 1 }))
    const high = questionStrength(
      state('q', { reps: 6, intervalStep: 5, streak: 3, lastOutcome: 'correct-sure' }),
    )
    expect(low).toBeLessThan(mid)
    expect(mid).toBeLessThan(high)
    expect(high).toBe(1)
  })
})

describe('domini per tema', () => {
  const questionIds = Array.from({ length: 10 }, (_, i) => `q${i}`)

  it('no dona percentatge amb poques respostes', () => {
    const result = computeTopicMastery({
      topicId: 'roses-t01', questionIds, reviews: new Map(),
      answers: answers(2, 0), today: TODAY,
    })
    expect(result.answered).toBeLessThan(MIN_ANSWERS_FOR_MASTERY)
    expect(result.mastery).toBeNull()
    expect(result.band).toBe('sense-dades')
  })

  it('penalitza la cobertura baixa encara que s’encerti tot', () => {
    // Tres preguntes dominades de deu: exactitud 100 % però cobertura 30 %.
    const reviews = new Map<string, ReviewState>()
    for (const id of questionIds.slice(0, 3)) {
      reviews.set(id, state(id, { reps: 5, intervalStep: 5, streak: 3, lastOutcome: 'correct-sure' }))
    }
    const result = computeTopicMastery({
      topicId: 'roses-t01', questionIds, reviews, answers: answers(5, 0), today: TODAY,
    })
    // 0,6 × 0,3 + 0,4 × 1 = 0,58
    expect(result.mastery).toBe(58)
    expect(result.seen).toBe(3)
    expect(result.band).toBe('mitja')
  })

  it('dona domini alt quan hi ha cobertura i exactitud', () => {
    const reviews = new Map<string, ReviewState>()
    for (const id of questionIds) {
      reviews.set(id, state(id, { reps: 5, intervalStep: 5, streak: 3, lastOutcome: 'correct-sure' }))
    }
    const result = computeTopicMastery({
      topicId: 'roses-t01', questionIds, reviews, answers: answers(10, 0), today: TODAY,
    })
    expect(result.mastery).toBe(100)
    expect(result.band).toBe('alt')
  })

  it('baixa amb els errors recents', () => {
    const reviews = new Map<string, ReviewState>()
    for (const id of questionIds) {
      reviews.set(id, state(id, { reps: 5, intervalStep: 5, streak: 3, lastOutcome: 'correct-sure' }))
    }
    const result = computeTopicMastery({
      topicId: 'roses-t01', questionIds, reviews, answers: answers(5, 5), today: TODAY,
    })
    // 0,6 × 1 + 0,4 × 0,5 = 0,8
    expect(result.mastery).toBe(80)
    expect(result.recentAccuracy).toBe(0.5)
  })

  it('compta les preguntes vençudes del tema', () => {
    const reviews = new Map<string, ReviewState>([
      ['q0', state('q0', { reps: 2, dueDay: TODAY - 3 })],
      ['q1', state('q1', { reps: 2, dueDay: TODAY })],
      ['q2', state('q2', { reps: 2, dueDay: TODAY + 4 })],
    ])
    const result = computeTopicMastery({
      topicId: 'roses-t01', questionIds, reviews, answers: answers(3, 0), today: TODAY,
    })
    expect(result.due).toBe(2)
  })
})

describe('semàfor i domini global', () => {
  it('marca les bandes al 40 i al 70', () => {
    expect(bandFor(null)).toBe('sense-dades')
    expect(bandFor(0)).toBe('baix')
    expect(bandFor(39)).toBe('baix')
    expect(bandFor(40)).toBe('mitja')
    expect(bandFor(69)).toBe('mitja')
    expect(bandFor(70)).toBe('alt')
    expect(bandFor(100)).toBe('alt')
  })

  it('el domini global ignora els temes sense dades', () => {
    const topics = [
      { topicId: 'a', mastery: 80, band: 'alt' as const, total: 5, seen: 5, due: 0, answered: 5, recentAccuracy: 1 },
      { topicId: 'b', mastery: 40, band: 'mitja' as const, total: 5, seen: 3, due: 0, answered: 4, recentAccuracy: 0.5 },
      { topicId: 'c', mastery: null, band: 'sense-dades' as const, total: 5, seen: 0, due: 0, answered: 0, recentAccuracy: null },
    ]
    expect(globalMastery(topics)).toBe(60)
    expect(globalMastery([topics[2]!])).toBeNull()
  })
})
