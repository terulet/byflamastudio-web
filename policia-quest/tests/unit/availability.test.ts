/**
 * Disponibilitat d'un simulacre.
 *
 * El que es prova aquí és una sola idea: un simulacre és vàlid quan es pot
 * muntar **la prova que descriuen les bases**, no quan hi ha prou preguntes.
 */
import { describe, expect, it } from 'vitest'
import { examAvailability, isCurrent } from '../../src/engines/availability.ts'
import type { ExamBlueprint, Question } from '../../src/domain/types.ts'
import { CULTURA_GENERAL_SCORING } from '../../src/engines/scoring.ts'

function q(id: string, tags: string[], extra: Partial<Question> = {}): Question {
  return {
    questionId: id,
    topicId: 'roses-t01',
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
      { sourceId: 'ce-1978', locator: 'art. 1', validAt: '2026-01-01', reviewStatus: 'verified' },
    ],
    dynamic: false,
    tags,
    ...extra,
  }
}

const CG_BLUEPRINT: ExamBlueprint = {
  blueprintId: 'cg',
  title: { ca: 'Cultura general' },
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

const many = (n: number, tags: string[], extra: Partial<Question> = {}): Question[] =>
  Array.from({ length: n }, (_, i) => q(`${tags[0]}-${i}`, tags, extra))

describe('vigència del contingut dinàmic', () => {
  it('el contingut permanent no caduca mai', () => {
    expect(isCurrent(q('p1', ['cultura-general']), '2099-01-01')).toBe(true)
  })

  it('una pregunta dinàmica és vigent fins a la seva data de revisió', () => {
    const actual = q('p2', ['actualitat'], { dynamic: true, reviewBy: '2026-11-30' })
    expect(isCurrent(actual, '2026-11-30')).toBe(true)
    expect(isCurrent(actual, '2026-12-01')).toBe(false)
  })
})

describe('disponibilitat amb composició fixada', () => {
  it('vint de cultura general no fan la prova de cultura general', () => {
    // El cas real: el banc en té de sobres d'un tipus i cap de l'altre.
    const status = examAvailability(many(22, ['cultura-general']), CG_BLUEPRINT, '2026-08-23')
    expect(status.ok).toBe(false)
    expect(status.quotas).toEqual([
      { tag: 'cultura-general', needed: 10, available: 22, missing: 0 },
      { tag: 'actualitat', needed: 10, available: 0, missing: 10 },
    ])
    expect(status.missingBody).toBe(10)
  })

  it('sobrar d’una quota no compensa que en falti d’una altra', () => {
    const pool = [...many(19, ['cultura-general']), ...many(1, ['actualitat'])]
    const status = examAvailability(pool, CG_BLUEPRINT, '2026-08-23')
    // Hi ha 20 preguntes actives, exactament les que demana la prova, i tot i
    // així no es pot muntar: el tribunal no intercanvia les categories.
    expect(pool).toHaveLength(20)
    expect(status.ok).toBe(false)
    expect(status.quotas[1]?.missing).toBe(9)
  })

  it('amb les dues quotes cobertes la prova es pot muntar', () => {
    const pool = [
      ...many(10, ['cultura-general']),
      ...many(11, ['actualitat'], { dynamic: true, reviewBy: '2026-12-31' }),
    ]
    const status = examAvailability(pool, CG_BLUEPRINT, '2026-08-23')
    expect(status.ok).toBe(true)
    expect(status.missingBody).toBe(0)
    expect(status.missingReserve).toBe(0)
  })

  it('l’actualitat caducada deixa de comptar i torna a bloquejar la prova', () => {
    const pool = [
      ...many(10, ['cultura-general']),
      ...many(11, ['actualitat'], { dynamic: true, reviewBy: '2026-11-30' }),
    ]
    expect(examAvailability(pool, CG_BLUEPRINT, '2026-11-30').ok).toBe(true)
    // L'endemà de caducar el paquet, la mateixa prova ja no es pot muntar.
    const after = examAvailability(pool, CG_BLUEPRINT, '2026-12-01')
    expect(after.ok).toBe(false)
    expect(after.quotas[1]?.available).toBe(0)
  })

  it('falta reserva quan les quotes es cobreixen justes', () => {
    const pool = [
      ...many(10, ['cultura-general']),
      ...many(10, ['actualitat'], { dynamic: true, reviewBy: '2026-12-31' }),
    ]
    const status = examAvailability(pool, CG_BLUEPRINT, '2026-08-23')
    // La prova es pot muntar; només falta la de reserva, que no compta.
    expect(status.ok).toBe(true)
    expect(status.missingReserve).toBe(1)
  })

  it('no compta les preguntes inactives ni les d’un altre tipus de prova', () => {
    const pool = [
      ...many(10, ['cultura-general']),
      ...many(10, ['actualitat'], { status: 'draft', dynamic: true, reviewBy: '2026-12-31' }),
      ...many(10, ['actualitat'], { track: 'coneixements-professionals' }),
    ]
    expect(examAvailability(pool, CG_BLUEPRINT, '2026-08-23').quotas[1]?.available).toBe(0)
  })
})

describe('disponibilitat sense composició fixada', () => {
  const CP: ExamBlueprint = {
    ...CG_BLUEPRINT,
    blueprintId: 'cp',
    questionCount: 40,
    reserveCount: 2,
    composition: undefined,
    track: 'coneixements-professionals',
  }

  it('només exigeix el nombre de preguntes del tipus corresponent', () => {
    const pool = many(42, ['professional'], { track: 'coneixements-professionals' })
    const status = examAvailability(pool, CP, '2026-08-23')
    expect(status.ok).toBe(true)
    expect(status.quotas).toEqual([])
    expect(status.missingReserve).toBe(0)
  })

  it('bloqueja si no arriba al cos de la prova', () => {
    const pool = many(39, ['professional'], { track: 'coneixements-professionals' })
    expect(examAvailability(pool, CP, '2026-08-23').ok).toBe(false)
  })
})
