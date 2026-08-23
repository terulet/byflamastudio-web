import { describe, expect, it } from 'vitest'
import { parseHash, toHash, type Route } from '../../src/app/router.ts'

/** Comprova que una ruta sobreviu al viatge d'anada i tornada per la URL. */
function roundTrip(route: Route): Route {
  return parseHash(toHash(route))
}

describe('encaminador', () => {
  it('la ruta buida és l’inici', () => {
    expect(parseHash('')).toEqual({ name: 'home' })
    expect(parseHash('#')).toEqual({ name: 'home' })
    expect(parseHash('#/')).toEqual({ name: 'home' })
  })

  it('les cinc destinacions principals fan el cicle complet', () => {
    for (const name of ['home', 'route', 'train', 'exams', 'progress', 'settings'] as const) {
      expect(roundTrip({ name })).toEqual({ name })
    }
  })

  it('una ruta desconeguda cau a l’inici en comptes de trencar', () => {
    expect(parseHash('#/inventat')).toEqual({ name: 'home' })
    expect(parseHash('#/topic')).toEqual({ name: 'home' })
    expect(parseHash('#/study')).toEqual({ name: 'home' })
    expect(parseHash('#/exam')).toEqual({ name: 'home' })
  })

  it('conserva el tema, l’examen i l’intent', () => {
    expect(roundTrip({ name: 'topic', topicId: 'roses-t35' })).toEqual({
      name: 'topic', topicId: 'roses-t35',
    })
    expect(roundTrip({ name: 'exam', blueprintId: 'roses-simulacre-complet' })).toEqual({
      name: 'exam', blueprintId: 'roses-simulacre-complet',
    })
    expect(roundTrip({ name: 'result', attemptId: 'a-123' })).toEqual({
      name: 'result', attemptId: 'a-123',
    })
  })

  it('conserva els temes seleccionats d’una sessió', () => {
    const route: Route = { name: 'study', mode: 'per-tema', topicIds: ['roses-t35', 'roses-t36'] }
    expect(roundTrip(route)).toEqual(route)
  })

  it('conserva els filtres d’una sessió', () => {
    const route: Route = {
      name: 'study',
      mode: 'per-tema',
      topicIds: ['roses-t01'],
      filters: { difficulty: 'dificil', origin: 'authored', state: 'failed' },
    }
    expect(roundTrip(route)).toEqual(route)
  })

  it('una sessió sense filtres no n’arrossega cap', () => {
    const route: Route = { name: 'study', mode: 'missio-del-dia' }
    expect(toHash(route)).toBe('#/study/missio-del-dia')
    expect(roundTrip(route)).toEqual(route)
  })

  it('descarta els valors de filtre que no reconeix', () => {
    const parsed = parseHash('#/study/per-tema?topics=roses-t01&difficulty=impossible&state=failed')
    expect(parsed).toEqual({
      name: 'study',
      mode: 'per-tema',
      topicIds: ['roses-t01'],
      filters: { state: 'failed' },
    })
  })
})
