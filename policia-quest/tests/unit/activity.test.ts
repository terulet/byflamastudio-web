/**
 * Ratxa i dies estudiats no mesuren el mateix, i el producte depèn d'això.
 *
 * La ratxa exigeix l'objectiu diari **complet** i es trenca; els dies estudiats
 * compten dies amb alguna resposta i no es trenquen mai. El cas que va motivar
 * separar-les és el primer test: qui estudia mitja sessió no fa ratxa, però el
 * seu dia ha d'existir en algun lloc.
 */
import { describe, expect, it } from 'vitest'
import { daysStudied } from '../../src/engines/activity.ts'

describe('dies estudiats', () => {
  it('un dia d’estudi parcial compta com a dia estudiat', () => {
    // Cinc respostes d'un objectiu de deu: no fa ratxa, però va existir.
    expect(daysStudied({ '20690': 5 })).toBe(1)
  })

  it('compta dies, no respostes: dues sessions el mateix dia són un dia', () => {
    expect(daysStudied({ '20690': 25 })).toBe(1)
  })

  it('no exigeix que els dies siguin seguits', () => {
    expect(daysStudied({ '20690': 3, '20695': 1, '20700': 12 })).toBe(3)
  })

  it('un dia registrat amb zero respostes no compta', () => {
    // Pot passar si algú obre una sessió i la tanca sense contestar res.
    expect(daysStudied({ '20690': 0, '20691': 4 })).toBe(1)
  })

  it('sense activitat, cap dia', () => {
    expect(daysStudied({})).toBe(0)
  })

  it('és l’històric sencer, no la finestra del calendari', () => {
    // El calendari de la pantalla de progrés ensenya 35 dies; això no.
    const long: Record<string, number> = {}
    for (let day = 20_000; day < 20_100; day++) long[String(day)] = 1
    expect(daysStudied(long)).toBe(100)
  })
})
