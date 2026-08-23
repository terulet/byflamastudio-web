import { describe, expect, it } from 'vitest'
import {
  MODE_SIZE,
  buildExamPaper,
  countDue,
  countFailed,
  selectSession,
} from '../../src/engines/selection.ts'
import { initialReviewState } from '../../src/engines/srs.ts'
import type { Question, ReviewState } from '../../src/domain/types.ts'

const TODAY = 20_000

function q(id: string, topicId = 'roses-t01', extra: Partial<Question> = {}): Question {
  return {
    questionId: id,
    topicId,
    track: 'coneixements-professionals',
    origin: 'authored',
    status: 'active',
    difficulty: 'mitjana',
    stem: `Enunciat de ${id}`,
    options: [
      { optionId: 'a', text: 'A' },
      { optionId: 'b', text: 'B' },
      { optionId: 'c', text: 'C' },
      { optionId: 'd', text: 'D' },
    ],
    correct: 'a',
    explanation: { ca: 'Explicació' },
    references: [
      { sourceId: 'ce-1978', locator: 'art. 1', validAt: '2026-08-23', reviewStatus: 'verified' },
    ],
    dynamic: false,
    tags: [],
    ...extra,
  }
}

function reviewMap(entries: Array<[string, Partial<ReviewState>]>): Map<string, ReviewState> {
  const m = new Map<string, ReviewState>()
  for (const [id, patch] of entries) {
    m.set(id, { ...initialReviewState(id), ...patch })
  }
  return m
}

describe('mides per mode', () => {
  it('respecta les mides documentades', () => {
    expect(MODE_SIZE['no-tinc-ganes']).toBe(3)
    expect(MODE_SIZE['sessio-expres']).toBe(5)
    expect(MODE_SIZE['missio-del-dia']).toBe(10)
    expect(MODE_SIZE.patrulla).toBe(20)
  })
})

describe('selecció prioritària', () => {
  const pool = Array.from({ length: 30 }, (_, i) =>
    q(`q${String(i).padStart(2, '0')}`, `roses-t${String((i % 4) + 1).padStart(2, '0')}`),
  )

  it('posa primer les preguntes vençudes', () => {
    const reviews = reviewMap([
      ['q00', { reps: 3, dueDay: TODAY - 5 }],
      ['q01', { reps: 3, dueDay: TODAY - 1 }],
      ['q02', { reps: 3, dueDay: TODAY + 10 }],
    ])
    const picked = selectSession({ mode: 'missio-del-dia', pool, reviews, today: TODAY, seed: 's' })
    const ids = picked.map((p) => p.questionId)
    expect(ids).toContain('q00')
    expect(ids).toContain('q01')
    expect(picked).toHaveLength(10)
  })

  it('el mode repassos només retorna vençudes', () => {
    const reviews = reviewMap([
      ['q00', { reps: 3, dueDay: TODAY - 5 }],
      ['q01', { reps: 3, dueDay: TODAY }],
      ['q02', { reps: 3, dueDay: TODAY + 10 }],
    ])
    const picked = selectSession({ mode: 'repassos', pool, reviews, today: TODAY, seed: 's' })
    expect(picked.map((p) => p.questionId).sort()).toEqual(['q00', 'q01'])
  })

  it('el mode errors només retorna preguntes fallades', () => {
    const reviews = reviewMap([
      ['q00', { reps: 3, dueDay: TODAY + 5, lapses: 2 }],
      ['q01', { reps: 3, dueDay: TODAY + 5, lapses: 0 }],
      ['q02', { reps: 1, dueDay: TODAY - 1, lapses: 1 }],
    ])
    const picked = selectSession({ mode: 'errors', pool, reviews, today: TODAY, seed: 's' })
    const ids = picked.map((p) => p.questionId).sort()
    expect(ids).toEqual(['q00', 'q02'])
  })

  it('el mode preguntes noves només retorna les mai vistes', () => {
    const reviews = reviewMap([
      ['q00', { reps: 3, dueDay: TODAY + 5 }],
      ['q01', { reps: 1, dueDay: TODAY + 5 }],
    ])
    const picked = selectSession({ mode: 'preguntes-noves', pool, reviews, today: TODAY, seed: 's' })
    const ids = picked.map((p) => p.questionId)
    expect(ids).not.toContain('q00')
    expect(ids).not.toContain('q01')
    expect(picked).toHaveLength(10)
  })

  it('"No tinc ganes" retorna exactament 3 preguntes', () => {
    const picked = selectSession({ mode: 'no-tinc-ganes', pool, reviews: new Map(), today: TODAY, seed: 's' })
    expect(picked).toHaveLength(3)
  })

  it('mai repeteix una pregunta dins la mateixa sessió', () => {
    const reviews = reviewMap([['q00', { reps: 3, dueDay: TODAY - 20, lapses: 5, flagged: true }]])
    const picked = selectSession({ mode: 'patrulla', pool, reviews, today: TODAY, seed: 's' })
    expect(new Set(picked.map((p) => p.questionId)).size).toBe(picked.length)
  })

  it('és determinista amb la mateixa llavor', () => {
    const a = selectSession({ mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 'igual' })
    const b = selectSession({ mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 'igual' })
    expect(a.map((x) => x.questionId)).toEqual(b.map((x) => x.questionId))
  })

  it('retorna menys preguntes si el banc no arriba, sense inventar-ne', () => {
    const picked = selectSession({
      mode: 'patrulla',
      pool: pool.slice(0, 4),
      reviews: new Map(),
      today: TODAY,
      seed: 's',
    })
    expect(picked).toHaveLength(4)
  })
})

describe('filtres', () => {
  const pool = [
    q('qa', 'roses-t01', { difficulty: 'facil', track: 'cultura-general' }),
    q('qb', 'roses-t02', { difficulty: 'dificil' }),
    q('qc', 'roses-t02', { origin: 'official', officialExam: {
      examId: 'x', year: 2025, placeType: 'propietat', testType: 'coneixements-professionals',
      originalNumber: 1, officialAnswer: 'a', reserve: false,
    } }),
    q('qd', 'roses-t03', { status: 'draft' }),
    q('qe', 'roses-t03', { status: 'historical' }),
  ]

  it('exclou sempre les preguntes que no són actives', () => {
    const picked = selectSession({ mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 's' })
    const ids = picked.map((p) => p.questionId)
    expect(ids).not.toContain('qd')
    expect(ids).not.toContain('qe')
  })

  it('filtra per tema', () => {
    const picked = selectSession({
      mode: 'per-tema', pool, reviews: new Map(), today: TODAY, seed: 's',
      topicIds: ['roses-t02'],
    })
    expect(picked.map((p) => p.questionId).sort()).toEqual(['qb', 'qc'])
  })

  it('filtra per prova, dificultat, origen i examen oficial', () => {
    const byTrack = selectSession({
      mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 's',
      filters: { track: 'cultura-general' },
    })
    expect(byTrack.map((p) => p.questionId)).toEqual(['qa'])

    const byDifficulty = selectSession({
      mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 's',
      filters: { difficulty: 'dificil' },
    })
    expect(byDifficulty.map((p) => p.questionId)).toEqual(['qb'])

    const official = selectSession({
      mode: 'patrulla', pool, reviews: new Map(), today: TODAY, seed: 's',
      filters: { onlyOfficialExam: true },
    })
    expect(official.map((p) => p.questionId)).toEqual(['qc'])
  })
})

describe('filtre per estat de repàs', () => {
  const pool = [q('n1'), q('n2'), q('f1'), q('d1'), q('m1')]
  const reviews = reviewMap([
    ['f1', { reps: 3, dueDay: TODAY + 5, lapses: 2 }],
    ['d1', { reps: 3, dueDay: TODAY - 1, lapses: 0 }],
    ['m1', { reps: 3, dueDay: TODAY + 9, lapses: 0, flagged: false }],
  ])

  it('"noves" només retorna preguntes mai vistes', () => {
    const picked = selectSession({
      mode: 'patrulla', pool, reviews, today: TODAY, seed: 's', filters: { state: 'new' },
    })
    expect(picked.map((p) => p.questionId).sort()).toEqual(['n1', 'n2'])
  })

  it('"fallades" retorna les que tenen errors o marca manual', () => {
    const withFlag = reviewMap([
      ['f1', { reps: 3, dueDay: TODAY + 5, lapses: 2 }],
      ['m1', { reps: 3, dueDay: TODAY + 9, lapses: 0, flagged: true }],
    ])
    const picked = selectSession({
      mode: 'patrulla', pool, reviews: withFlag, today: TODAY, seed: 's', filters: { state: 'failed' },
    })
    expect(picked.map((p) => p.questionId).sort()).toEqual(['f1', 'm1'])
  })

  it('"per repassar" només retorna les vençudes', () => {
    const picked = selectSession({
      mode: 'patrulla', pool, reviews, today: TODAY, seed: 's', filters: { state: 'due' },
    })
    expect(picked.map((p) => p.questionId)).toEqual(['d1'])
  })

  it('els filtres s’acumulen', () => {
    const mixed = [
      q('x1', 'roses-t01', { difficulty: 'facil' }),
      q('x2', 'roses-t01', { difficulty: 'dificil' }),
    ]
    const picked = selectSession({
      mode: 'patrulla', pool: mixed, reviews: new Map(), today: TODAY, seed: 's',
      filters: { state: 'new', difficulty: 'dificil' },
    })
    expect(picked.map((p) => p.questionId)).toEqual(['x2'])
  })
})

describe('comptadors de la pantalla d’inici', () => {
  const pool = [q('q1'), q('q2'), q('q3'), q('q4', 'roses-t01', { status: 'draft' })]

  it('compta les vençudes i les fallades', () => {
    const reviews = reviewMap([
      ['q1', { reps: 2, dueDay: TODAY - 1, lapses: 1 }],
      ['q2', { reps: 2, dueDay: TODAY + 3, lapses: 2 }],
      ['q3', { reps: 2, dueDay: TODAY, lapses: 0 }],
      ['q4', { reps: 2, dueDay: TODAY - 9, lapses: 9 }],
    ])
    expect(countDue(pool, reviews, TODAY)).toBe(2)
    expect(countFailed(pool, reviews)).toBe(2)
  })
})

describe('muntatge de simulacres', () => {
  const pool = Array.from({ length: 120 }, (_, i) =>
    q(`p${String(i).padStart(3, '0')}`, `roses-t${String((i % 40) + 1).padStart(2, '0')}`),
  )

  it('munta un quadernet de 40 preguntes sense repeticions', () => {
    const paper = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    expect(paper).toHaveLength(40)
    expect(new Set(paper.map((p) => p.questionId)).size).toBe(40)
  })

  it('reparteix la cobertura entre temes en comptes de concentrar-la', () => {
    const paper = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    // Amb 40 temes disponibles i 40 preguntes, ha de tocar tots els temes.
    expect(new Set(paper.map((p) => p.topicId)).size).toBe(40)
  })

  it('és determinista amb la mateixa llavor i diferent amb una altra', () => {
    const a = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    const b = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    const c = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e2' })
    expect(a.map((x) => x.questionId)).toEqual(b.map((x) => x.questionId))
    expect(a.map((x) => x.questionId)).not.toEqual(c.map((x) => x.questionId))
  })

  it('exclou les preguntes ja usades en una altra prova del mateix quadernet', () => {
    const first = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    const second = buildExamPaper({
      pool,
      track: 'coneixements-professionals',
      count: 40,
      seed: 'e1',
      exclude: first.map((q) => q.questionId),
    })
    const firstIds = new Set(first.map((q) => q.questionId))
    for (const q of second) {
      expect(firstIds.has(q.questionId), `${q.questionId} es repeteix entre proves`).toBe(false)
    }
  })

  it('no inventa preguntes si el banc és més petit que el quadernet', () => {
    const small = pool.slice(0, 12)
    const paper = buildExamPaper({ pool: small, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    expect(paper).toHaveLength(12)
  })

  it('afegeix les preguntes de reserva al final, sense repetir-ne cap', () => {
    const paper = buildExamPaper({
      pool,
      track: 'coneixements-professionals',
      count: 40,
      reserveCount: 2,
      seed: 'e1',
    })
    expect(paper).toHaveLength(42)
    expect(new Set(paper.map((p) => p.questionId)).size).toBe(42)
  })

  it('el cos del quadernet no canvia perquè hi hagi reserves', () => {
    const base = buildExamPaper({ pool, track: 'coneixements-professionals', count: 40, seed: 'e1' })
    const withReserve = buildExamPaper({
      pool,
      track: 'coneixements-professionals',
      count: 40,
      reserveCount: 2,
      seed: 'e1',
    })
    // Les 40 primeres són les mateixes i en el mateix ordre: la reserva
    // s'afegeix, no reordena la prova.
    expect(withReserve.slice(0, 40).map((x) => x.questionId)).toEqual(base.map((x) => x.questionId))
  })

  it('sacrifica les reserves abans que el cos si el banc no dona per a tot', () => {
    const small = pool.slice(0, 41)
    const paper = buildExamPaper({
      pool: small,
      track: 'coneixements-professionals',
      count: 40,
      reserveCount: 2,
      seed: 'e1',
    })
    // Hi ha 41 preguntes per a 40 + 2: el cos es completa i queda una reserva.
    expect(paper).toHaveLength(41)
  })
})
