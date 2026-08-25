/**
 * Si una pregunta dinàmica encara no ha caducat.
 *
 * El contingut dinàmic (càrrecs, xifres, actualitat) porta `reviewBy`. Passada
 * aquesta data no es pot donar per bo: no és que sigui fals, és que ningú
 * n'ha respost. Una prova d'actualitat muntada amb preguntes caducades és
 * pitjor que no oferir-la.
 *
 * Viu en un mòdul propi, sense cap altra dependència, perquè tant
 * `availability.ts` com `official-evidence.ts` en necessiten la mateixa
 * resposta i cap dels dos pot dependre de l'altre: `official-evidence.ts` ja
 * decideix per als simulacres, i `availability.ts` ha de poder consultar
 * aquella decisió sense crear un cicle d'importació.
 */
import type { Question } from '../domain/types.ts'

export function isCurrent(question: Question, todayIso: string): boolean {
  if (!question.dynamic) return true
  return question.reviewBy !== undefined && question.reviewBy >= todayIso
}
