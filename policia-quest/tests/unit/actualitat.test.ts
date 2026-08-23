/**
 * La porta de l'actualitat, i què passa quan s'obre.
 *
 * L'actualitat és l'únic contingut que **afirma com és el món ara mateix**. Si
 * s'equivoca no ensenya una norma antiga: ensenya un fet fals. Aquests tests
 * fixen dues coses:
 *
 *  1. Que una pregunta d'actualitat sense les garanties no pot comptar.
 *  2. Que quan un paquet legítim existeix, el simulacre de cultura general es
 *     desbloqueja sol, sense tocar el motor ni el validador.
 *
 * El segon punt es prova amb **fixtures**, no amb contingut real: mentre no hi
 * hagi fonts vigents contrastades, el banc real ha de continuar buit. Provar el
 * camí de desbloqueig no és el mateix que desbloquejar-lo.
 */
import { describe, expect, it } from 'vitest'
import { examAvailability, isCurrent } from '../../src/engines/availability.ts'
import { currentAffairsIssues, packIssues } from '../../src/engines/actualitat.ts'
import { buildExamPaper, selectSession } from '../../src/engines/selection.ts'
import { isoToEpochDay } from '../../src/util/date.ts'
import type { ExamBlueprint, Question } from '../../src/domain/types.ts'
import { CULTURA_GENERAL_SCORING } from '../../src/engines/scoring.ts'
import { ROSES_PACK } from '../../content/municipalities/roses/index.ts'

const TODAY = '2026-08-23'

const CG: ExamBlueprint = {
  blueprintId: 'roses-cultura-general',
  title: { ca: 'Simulacre de cultura general' },
  track: 'cultura-general',
  questionCount: 20,
  durationMinutes: 20,
  reserveCount: 1,
  scoring: CULTURA_GENERAL_SCORING,
  composition: [
    { label: { ca: 'Cultura general' }, tag: 'cultura-general', count: 10 },
    { label: { ca: 'Actualitat' }, tag: 'actualitat', count: 10 },
  ],
  contentStatus: 'ready',
  sourceId: 'roses-bases-2026-interins',
}

function question(id: string, tags: string[], extra: Partial<Question> = {}): Question {
  return {
    questionId: id,
    topicId: 'roses-t31',
    track: 'cultura-general',
    origin: 'authored',
    status: 'active',
    difficulty: 'mitjana',
    stem: `Enunciat de prova ${id}`,
    options: [
      { optionId: 'a', text: 'A' },
      { optionId: 'b', text: 'B' },
      { optionId: 'c', text: 'C' },
      { optionId: 'd', text: 'D' },
    ],
    correct: 'a',
    explanation: { ca: 'Perquè sí.' },
    references: [
      { sourceId: 'roses-web-municipi', locator: 'p. 1', validAt: TODAY, reviewStatus: 'verified' },
    ],
    dynamic: false,
    tags,
    ...extra,
  }
}

/** Una pregunta d'actualitat com cal: caduca, i la data encara no ha arribat. */
const actualitat = (i: number, reviewBy = '2026-11-30'): Question =>
  question(`act-${i}`, ['actualitat'], { dynamic: true, reviewBy, topicId: 'roses-t31' })

describe('estat real del banc', () => {
  it('avui no hi ha cap pregunta d’actualitat vigent', () => {
    const current = ROSES_PACK.questions.filter(
      (q) => q.tags.includes('actualitat') && q.status === 'active' && isCurrent(q, TODAY),
    )
    expect(current).toHaveLength(0)
  })

  it('i per això el simulacre de cultura general està bloquejat i ho declara', () => {
    const cg = ROSES_PACK.blueprints.find((b) => b.blueprintId === 'roses-cultura-general')!
    expect(examAvailability(ROSES_PACK.questions, cg, TODAY).ok).toBe(false)
    expect(cg.contentStatus).toBe('blocked-missing-content')
  })

  it('les preguntes d’actualitat dels exàmens antics no compten com a vigents', () => {
    // Un quadernet de 2025 pregunta qui és «l'actual» ministre. Era cert aquell
    // dia. Comptar-lo avui seria afirmar l'estat del món d'una altra data.
    const historical = ROSES_PACK.questions.filter((q) => q.origin === 'official')
    expect(historical.length).toBeGreaterThan(0)
    for (const q of historical) {
      expect(q.tags).not.toContain('actualitat')
    }
  })
})

describe('el contingut caducat no s’escola a una sessió d’estudi', () => {
  it('una sessió normal no serveix preguntes d’examen antigues de cultura general', () => {
    // Va aparèixer de debò: «Qui és l'actual regidor/a de Seguretat ciutadana?»
    // en una sessió Patrulla, sense data, com si fos el present.
    const session = selectSession({
      mode: 'patrulla',
      pool: ROSES_PACK.questions,
      reviews: new Map(),
      today: isoToEpochDay(TODAY),
      todayIso: TODAY,
      seed: 'test',
    })
    const stale = session.filter((q) => !isCurrent(q, TODAY))
    expect(stale.map((q) => q.questionId)).toEqual([])
  })

  it('però amb el filtre d’examen oficial sí que s’hi pot arribar, com a història', () => {
    const session = selectSession({
      mode: 'patrulla',
      pool: ROSES_PACK.questions,
      reviews: new Map(),
      today: isoToEpochDay(TODAY),
      todayIso: TODAY,
      filters: { origin: 'official' },
      seed: 'test',
    })
    expect(session.length).toBeGreaterThan(0)
    for (const q of session) expect(q.origin).toBe('official')
    // I cada una porta la data del seu quadernet, que és el que dona context.
    for (const q of session) expect(q.officialExam?.examId).toBeTruthy()
  })
})

describe('la porta refusa el que no està demostrat', () => {
  const context = {
    packedQuestionIds: new Set(['act-ok']),
    sources: [
      { sourceId: 'font-amb-data', title: 'Font', issuer: 'X', url: 'https://exemple.cat/a',
        kind: 'pagina-institucional', scope: 'roses', publishedAt: '2026-08-01',
        consultedAt: '2026-08-24', status: 'vigent', fetchStatus: 'downloaded' },
      { sourceId: 'font-sense-data', title: 'Font', issuer: 'X', url: 'https://exemple.cat/b',
        kind: 'pagina-institucional', scope: 'roses',
        consultedAt: '2026-08-24', status: 'vigent', fetchStatus: 'downloaded' },
    ] as never,
  }

  const base = (extra: Partial<Question> = {}): Question =>
    question('act-ok', ['actualitat'], {
      dynamic: true,
      reviewBy: '2026-11-30',
      references: [
        { sourceId: 'font-amb-data', locator: 'titular', validAt: '2026-08-01', reviewStatus: 'verified' },
      ],
      ...extra,
    })

  it('una pregunta d’actualitat completa passa', () => {
    expect(currentAffairsIssues(base(), context)).toEqual([])
  })

  it('refusa una referència que no està verificada', () => {
    const q = base({
      references: [
        { sourceId: 'font-amb-data', locator: 'titular', validAt: '2026-08-01', reviewStatus: 'pending-source-verification' },
      ],
    })
    expect(currentAffairsIssues(q, context).join(' ')).toMatch(/font contrastada/)
  })

  it('refusa una font sense data de publicació', () => {
    const q = base({
      references: [
        { sourceId: 'font-sense-data', locator: 'titular', validAt: '2026-08-01', reviewStatus: 'verified' },
      ],
    })
    expect(currentAffairsIssues(q, context).join(' ')).toMatch(/data de publicació/)
  })

  it('refusa una pregunta d’examen històric disfressada d’actualitat', () => {
    const q = base({ origin: 'official' })
    expect(currentAffairsIssues(q, context).join(' ')).toMatch(/material històric/)
  })

  it('refusa la que no caduca i la que està fora de cap paquet', () => {
    expect(currentAffairsIssues(base({ dynamic: false }), context).join(' ')).toMatch(/dynamic/)
    const solta = { ...base(), questionId: 'act-solta' }
    expect(currentAffairsIssues(solta, context).join(' ')).toMatch(/fora de cap paquet/)
  })

  it('un paquet que caduca abans d’acabar el període que cobreix es refusa', () => {
    const issues = packIssues(
      { packId: 'p', coversFrom: '2026-01-01', coversTo: '2026-08-24', expiresAt: '2026-06-30', questionIds: [] },
      [],
    )
    expect(issues.join(' ')).toMatch(/caduca abans/)
  })

  it('i un paquet amb una pregunta que es declara vigent més enllà, també', () => {
    const q = base({ reviewBy: '2027-06-30' })
    const issues = packIssues(
      { packId: 'p', coversFrom: '2026-01-01', coversTo: '2026-08-24', expiresAt: '2026-11-30', questionIds: ['act-ok'] },
      [q],
    )
    expect(issues.join(' ')).toMatch(/més enllà de la caducitat/)
  })
})

describe('el camí de desbloqueig, provat amb fixtures', () => {
  const permanents = Array.from({ length: 12 }, (_, i) => question(`cg-${i}`, ['cultura-general']))

  it('amb deu d’actualitat vigents i deu de cultura general, la prova es pot muntar', () => {
    const pool = [...permanents, ...Array.from({ length: 11 }, (_, i) => actualitat(i))]
    const status = examAvailability(pool, CG, TODAY)
    expect(status.ok).toBe(true)
    expect(status.missingBody).toBe(0)
  })

  it('i el quadernet surt amb la proporció exacta que fixen les bases', () => {
    const pool = [...permanents, ...Array.from({ length: 11 }, (_, i) => actualitat(i))]
    const paper = buildExamPaper({
      pool,
      track: 'cultura-general',
      count: 20,
      reserveCount: 1,
      composition: CG.composition,
      todayIso: TODAY,
      seed: 'fixture',
    })
    const body = paper.slice(0, 20)
    expect(body.filter((q) => q.tags.includes('cultura-general'))).toHaveLength(10)
    expect(body.filter((q) => q.tags.includes('actualitat'))).toHaveLength(10)
  })

  it('el dia que el paquet caduca, el simulacre es torna a bloquejar tot sol', () => {
    const pool = [...permanents, ...Array.from({ length: 11 }, (_, i) => actualitat(i, '2026-11-30'))]
    expect(examAvailability(pool, CG, '2026-11-30').ok).toBe(true)
    expect(examAvailability(pool, CG, '2026-12-01').ok).toBe(false)
    // I el quadernet tampoc no les agafa: no és només l'avís, és el motor.
    const paper = buildExamPaper({
      pool,
      track: 'cultura-general',
      count: 20,
      composition: CG.composition,
      todayIso: '2026-12-01',
      seed: 'fixture',
    })
    expect(paper.filter((q) => q.tags.includes('actualitat'))).toHaveLength(0)
  })

  /*
   * El simulacre complet encadena les dues proves. La seva disponibilitat és la
   * conjunció de les dues seccions: s'obre quan totes dues s'obren i es tanca
   * quan una es tanca. Es prova amb fixtures perquè el banc real de cultura
   * general continua sense actualitat.
   */
  const CP: ExamBlueprint = {
    ...CG,
    blueprintId: 'roses-coneixements-professionals',
    title: { ca: 'Simulacre de coneixements professionals' },
    track: 'coneixements-professionals',
    questionCount: 40,
    reserveCount: 2,
    composition: undefined,
  }
  const professionals = Array.from({ length: 42 }, (_, i) =>
    question(`cp-${i}`, ['professional'], { track: 'coneixements-professionals' }),
  )

  const completeAvailable = (pool: Question[], today: string): boolean =>
    [CG, CP].every((bp) => examAvailability(pool, bp, today).ok)

  it('el simulacre complet s’obre quan les dues proves s’obren', () => {
    const pool = [
      ...permanents,
      ...Array.from({ length: 11 }, (_, i) => actualitat(i)),
      ...professionals,
    ]
    expect(examAvailability(pool, CG, TODAY).ok).toBe(true)
    expect(examAvailability(pool, CP, TODAY).ok).toBe(true)
    expect(completeAvailable(pool, TODAY)).toBe(true)
  })

  it('i es torna a tancar quan caduca l’actualitat, encara que professionals segueixi bé', () => {
    const pool = [
      ...permanents,
      ...Array.from({ length: 11 }, (_, i) => actualitat(i, '2026-11-30')),
      ...professionals,
    ]
    expect(completeAvailable(pool, '2026-11-30')).toBe(true)
    // L'endemà: professionals continua disponible, cultura general no, i per
    // tant el complet tampoc.
    expect(examAvailability(pool, CP, '2026-12-01').ok).toBe(true)
    expect(examAvailability(pool, CG, '2026-12-01').ok).toBe(false)
    expect(completeAvailable(pool, '2026-12-01')).toBe(false)
  })

  it('nou d’actualitat no són deu, per molt que en sobrin de permanents', () => {
    const pool = [...permanents, ...Array.from({ length: 9 }, (_, i) => actualitat(i))]
    expect(examAvailability(pool, CG, TODAY).ok).toBe(false)
  })
})
