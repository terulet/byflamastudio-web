/**
 * Disponibilitat d'un simulacre.
 *
 * Un simulacre no és vàlid perquè el banc tingui prou preguntes: és vàlid quan
 * el banc pot muntar **la prova que descriuen les bases**. La de cultura
 * general de Roses són 10 preguntes de cultura general i 10 d'actualitat, més
 * una de reserva. Vint preguntes de cultura general no són aquesta prova, per
 * molt que en siguin vint.
 *
 * Aquest mòdul és l'única resposta a «es pot muntar aquesta prova, avui?». El
 * fan servir tres llocs i han de coincidir sempre:
 *
 *  - `scripts/validate-content.ts`, que trenca el build si el que diu el
 *    plànol i el que pot donar el banc no quadren.
 *  - `scripts/report-coverage.ts`, que publica el dèficit exacte.
 *  - La pantalla de simulacres, que bloqueja el que no es pot muntar en comptes
 *    d'oferir una prova que no és la real.
 *
 * És pur: el dia entra com a paràmetre. L'actualitat caduca, i una prova que
 * avui es pot muntar pot deixar de poder-se muntar d'aquí a tres mesos sense
 * que ningú toqui una línia de codi. Això és intencionat.
 */
import type { ExamBlueprint, Question } from '../domain/types.ts'

/**
 * Una pregunta és vigent si no caduca o si encara no ha caducat.
 *
 * El contingut dinàmic (càrrecs, xifres, actualitat) porta `reviewBy`. Passada
 * aquesta data no es pot donar per bo: no és que sigui fals, és que ningú
 * n'ha respost. Una prova d'actualitat muntada amb preguntes caducades és
 * pitjor que no oferir-la.
 */
export function isCurrent(question: Question, todayIso: string): boolean {
  if (!question.dynamic) return true
  return question.reviewBy !== undefined && question.reviewBy >= todayIso
}

/** Estat d'una de les quotes que fixa el plànol (p. ex. 10 d'actualitat). */
export interface QuotaStatus {
  tag: string
  needed: number
  /** Preguntes actives, vigents i amb aquesta etiqueta. */
  available: number
  missing: number
}

export interface ExamAvailability {
  blueprintId: string
  /** Es pot muntar la prova tal com la descriuen les bases. */
  ok: boolean
  /** Quotes declarades pel plànol. Buit si el plànol no en fixa cap. */
  quotas: QuotaStatus[]
  /** Preguntes del cos de la prova que falten, sumant totes les quotes. */
  missingBody: number
  /** Preguntes de reserva que falten. No bloqueja: la reserva ni tan sols compta. */
  missingReserve: number
  /** Total de preguntes actives i vigents del tipus de la prova. */
  poolSize: number
}

/**
 * Comprova si el banc pot muntar un plànol el dia indicat.
 *
 * Sense composició declarada, l'única exigència és el nombre de preguntes del
 * tipus corresponent. Amb composició, cada quota s'ha de satisfer **per
 * separat**: sobrar-ne d'una no compensa que en falti d'una altra, perquè el
 * tribunal no les intercanvia.
 */
export function examAvailability(
  pool: readonly Question[],
  blueprint: ExamBlueprint,
  todayIso: string,
): ExamAvailability {
  const eligible = pool.filter(
    (q) => q.status === 'active' && q.track === blueprint.track && isCurrent(q, todayIso),
  )

  if (!blueprint.composition || blueprint.composition.length === 0) {
    const missingBody = Math.max(0, blueprint.questionCount - eligible.length)
    return {
      blueprintId: blueprint.blueprintId,
      ok: missingBody === 0,
      quotas: [],
      missingBody,
      missingReserve: Math.max(
        0,
        Math.min(blueprint.reserveCount, blueprint.questionCount + blueprint.reserveCount - eligible.length),
      ),
      poolSize: eligible.length,
    }
  }

  const quotas: QuotaStatus[] = blueprint.composition.map((slot) => {
    const available = eligible.filter((q) => q.tags.includes(slot.tag)).length
    return {
      tag: slot.tag,
      needed: slot.count,
      available,
      missing: Math.max(0, slot.count - available),
    }
  })

  const missingBody = quotas.reduce((sum, q) => sum + q.missing, 0)
  // La reserva pot sortir de qualsevol quota; només cal que en sobrin.
  const spare = quotas.reduce((sum, q) => sum + Math.max(0, q.available - q.needed), 0)
  return {
    blueprintId: blueprint.blueprintId,
    ok: missingBody === 0,
    quotas,
    missingBody,
    missingReserve: missingBody > 0 ? blueprint.reserveCount : Math.max(0, blueprint.reserveCount - spare),
    poolSize: eligible.length,
  }
}
