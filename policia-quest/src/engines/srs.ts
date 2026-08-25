/**
 * Motor de repetició espaiada.
 *
 * Disseny: simple, determinista i explicable. No és un SM-2 amb factors de
 * facilitat: per a un temari tancat d'oposició, una escala fixa d'intervals
 * amb regressió per error és més previsible i molt més fàcil de provar.
 *
 * ─── Fórmula exacta ───────────────────────────────────────────────────────
 *
 * Escala d'intervals (dies), indexada per `intervalStep`:
 *
 *     [1, 3, 7, 14, 30, 60]
 *
 * Estats (`phase`): new → learning → review → mastered.
 *
 * Transicions segons el resultat:
 *
 *   correct-sure    step += 1   (topa al màxim de l'escala)
 *   correct-unsure  step += 1 només si step === 0; si no, es queda igual.
 *                   Encertar amb dubtes NO val el mateix que encertar amb
 *                   seguretat: consolida però no accelera.
 *   wrong           step = max(0, step − 2)  · lapses += 1 · streak = 0
 *   dont-know       step = max(0, step − 1)  · lapses += 1 · streak = 0
 *                   "No ho sé" és un error d'aprenentatge, però es penalitza
 *                   menys que fallar: no ha d'humiliar ni bloquejar.
 *
 * Fase resultant:
 *
 *   step === 0                        → 'learning'  (o 'new' si mai s'ha vist)
 *   1 ≤ step ≤ 3                      → 'review'
 *   step ≥ 4 i streak ≥ 2 i lapses    → 'mastered'
 *     no ha crescut en aquesta resposta
 *   step ≥ 4 en qualsevol altre cas   → 'review'
 *
 * Venciment: `dueDay = avui + INTERVALS[step]`.
 * Una pregunta és "vençuda" quan `dueDay <= avui`.
 *
 * La prioritat de repàs (com més alt, més urgent) combina dies de retard,
 * nombre de errors acumulats i marcatge manual. Vegeu `reviewPriority`.
 */
import type { Outcome, ReviewState } from '../domain/types.ts'

/** Escala d'intervals en dies. Documentada a ARCHITECTURE.md. */
export const INTERVALS = [1, 3, 7, 14, 30, 60] as const

export const MAX_STEP = INTERVALS.length - 1

/** Estat inicial d'una pregunta que l'usuari no ha vist mai. */
export function initialReviewState(questionId: string): ReviewState {
  return {
    questionId,
    phase: 'new',
    intervalStep: 0,
    dueDay: 0,
    lapses: 0,
    reps: 0,
    streak: 0,
    flagged: false,
  }
}

/** Interval en dies per a un pas donat. */
export function intervalDays(step: number): number {
  const clamped = Math.min(Math.max(step, 0), MAX_STEP)
  return INTERVALS[clamped]!
}

/**
 * Aplica una resposta a l'estat de repàs i retorna el nou estat.
 * Funció pura: no muta l'entrada.
 */
export function applyOutcome(
  state: ReviewState,
  outcome: Outcome,
  today: number,
): ReviewState {
  let step = state.intervalStep
  let lapses = state.lapses
  let streak = state.streak

  switch (outcome) {
    case 'correct-sure':
      step = Math.min(step + 1, MAX_STEP)
      streak = streak + 1
      break
    case 'correct-unsure':
      // Consolida però no accelera, excepte per treure-la de l'inici.
      step = step === 0 ? 1 : step
      streak = streak + 1
      break
    case 'wrong':
      step = Math.max(0, step - 2)
      lapses = lapses + 1
      streak = 0
      break
    case 'dont-know':
      step = Math.max(0, step - 1)
      lapses = lapses + 1
      streak = 0
      break
  }

  const reps = state.reps + 1
  const failed = outcome === 'wrong' || outcome === 'dont-know'

  let phase: ReviewState['phase']
  if (step === 0) phase = 'learning'
  else if (step >= 4 && streak >= 2 && !failed) phase = 'mastered'
  else phase = 'review'

  return {
    ...state,
    phase,
    intervalStep: step,
    dueDay: today + intervalDays(step),
    lapses,
    reps,
    streak,
    lastAnsweredDay: today,
    lastOutcome: outcome,
    // Encertar amb seguretat treu la marca manual de "repassar després".
    flagged: outcome === 'correct-sure' ? false : state.flagged,
  }
}

/** Una pregunta està vençuda si ja s'ha vist i toca repassar-la. */
export function isDue(state: ReviewState, today: number): boolean {
  return state.reps > 0 && state.dueDay <= today
}

/**
 * Prioritat de repàs. Com més alt, abans s'ha de veure.
 *
 *   retard (dies vençuda) × 10  +  errors acumulats × 5  +  bonus de marcatge
 *
 * Les preguntes marcades manualment sumen 25 perquè pugin per damunt del
 * soroll però sense monopolitzar la sessió.
 */
export function reviewPriority(state: ReviewState, today: number): number {
  const overdue = Math.max(0, today - state.dueDay)
  return overdue * 10 + state.lapses * 5 + (state.flagged ? 25 : 0)
}

/** Deriva l'estat de repàs, creant-lo si encara no existeix. */
export function getOrInit(
  map: ReadonlyMap<string, ReviewState>,
  questionId: string,
): ReviewState {
  return map.get(questionId) ?? initialReviewState(questionId)
}

/** Tradueix la resposta d'estudi a un `Outcome`. */
export function outcomeFor(
  isCorrect: boolean,
  dontKnow: boolean,
  confidence: 'unsure' | 'sure' | null,
): Outcome {
  if (dontKnow) return 'dont-know'
  if (!isCorrect) return 'wrong'
  return confidence === 'unsure' ? 'correct-unsure' : 'correct-sure'
}
