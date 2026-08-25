/**
 * Domini per tema.
 *
 * ─── Fórmula exacta ───────────────────────────────────────────────────────
 *
 * Per a cada pregunta activa del tema es calcula una *força* entre 0 i 1:
 *
 *     força = 0,70 · (intervalStep / MAX_STEP)
 *           + 0,20 · (streak ≥ 1 ? 1 : 0)
 *           + 0,10 · (lastOutcome === 'correct-sure' ? 1 : 0)
 *
 * Una pregunta que no s'ha vist mai té força 0. Això fa que el domini
 * reflecteixi també la **cobertura**: no es pot dominar un tema del qual
 * només s'han contestat dues preguntes de vint.
 *
 *     forçaMitjana = Σ força(q) / nombre de preguntes actives del tema
 *
 * L'exactitud recent és la proporció d'encerts de les últimes
 * `RECENT_WINDOW` respostes del tema (les respostes "No ho sé" compten com a
 * error, però amb menys pes perquè no marquen `wrong`).
 *
 *     domini = round(100 · (0,60 · forçaMitjana + 0,40 · exactitudRecent))
 *
 * ─── Honestedat estadística ───────────────────────────────────────────────
 *
 * Amb menys de `MIN_ANSWERS_FOR_MASTERY` respostes al tema, `mastery` és
 * `null`: la interfície mostra "encara sense dades" en comptes d'un
 * percentatge enganyós construït sobre dues respostes.
 */
import { MAX_STEP } from './srs.ts'
import type { AnswerRecord, ReviewState } from '../domain/types.ts'

/** Mínim de respostes al tema abans de mostrar un percentatge. */
export const MIN_ANSWERS_FOR_MASTERY = 3

/**
 * Mínim de respostes abans de mostrar l'exactitud global.
 *
 * És més alt que el del domini per tema perquè una exactitud és una xifra molt
 * llaminera i molt fàcil de malinterpretar: "100 %" després d'una sola resposta
 * no informa de res i genera falsa confiança.
 */
export const MIN_ANSWERS_FOR_ACCURACY = 10

/** Finestra d'exactitud recent, en nombre de respostes. */
export const RECENT_WINDOW = 20

export type MasteryBand = 'sense-dades' | 'baix' | 'mitja' | 'alt'

export interface TopicMastery {
  topicId: string
  /** 0–100, o `null` si encara no hi ha prou dades. */
  mastery: number | null
  band: MasteryBand
  /** Preguntes actives del tema. */
  total: number
  /** Preguntes del tema vistes almenys una vegada. */
  seen: number
  /** Preguntes vençudes per repassar. */
  due: number
  answered: number
  recentAccuracy: number | null
}

/**
 * Força individual d'una pregunta segons el seu estat de repàs.
 *
 * Es calcula en centèsimes senceres i es divideix al final: amb aritmètica de
 * coma flotant, 0,7 + 0,2 + 0,1 dona 0,9999999999999999 i un tema perfectament
 * dominat es mostraria com a 99 %.
 */
export function questionStrength(state: ReviewState | undefined): number {
  if (!state || state.reps === 0) return 0
  const step = Math.min(Math.max(state.intervalStep, 0), MAX_STEP)
  const base = Math.round((70 * step) / MAX_STEP)
  const streakBonus = state.streak >= 1 ? 20 : 0
  const sureBonus = state.lastOutcome === 'correct-sure' ? 10 : 0
  return Math.min(100, base + streakBonus + sureBonus) / 100
}

export interface MasteryInput {
  topicId: string
  /** Ids de les preguntes actives del tema. */
  questionIds: readonly string[]
  reviews: ReadonlyMap<string, ReviewState>
  /** Respostes del tema, de la més antiga a la més recent. */
  answers: readonly AnswerRecord[]
  today: number
}

export function computeTopicMastery(input: MasteryInput): TopicMastery {
  const { topicId, questionIds, reviews, answers, today } = input
  const total = questionIds.length

  let strengthSum = 0
  let seen = 0
  let due = 0
  for (const qid of questionIds) {
    const state = reviews.get(qid)
    strengthSum += questionStrength(state)
    if (state && state.reps > 0) {
      seen++
      if (state.dueDay <= today) due++
    }
  }

  const recent = answers.slice(-RECENT_WINDOW)
  const recentAccuracy =
    recent.length === 0
      ? null
      : recent.filter((a) => a.correct).length / recent.length

  const answered = answers.length
  if (answered < MIN_ANSWERS_FOR_MASTERY) {
    return {
      topicId, mastery: null, band: 'sense-dades',
      total, seen, due, answered, recentAccuracy,
    }
  }

  const averageStrength = total === 0 ? 0 : strengthSum / total
  const mastery = Math.round(100 * (0.6 * averageStrength + 0.4 * (recentAccuracy ?? 0)))

  return {
    topicId,
    mastery,
    band: bandFor(mastery),
    total, seen, due, answered, recentAccuracy,
  }
}

/** Semàfor: vermell < 40 ≤ ambre < 70 ≤ verd. */
export function bandFor(mastery: number | null): MasteryBand {
  if (mastery === null) return 'sense-dades'
  if (mastery < 40) return 'baix'
  if (mastery < 70) return 'mitja'
  return 'alt'
}

/** Domini global: mitjana dels temes que ja tenen dades. */
export function globalMastery(topics: readonly TopicMastery[]): number | null {
  const withData = topics.filter((t) => t.mastery !== null)
  if (withData.length === 0) return null
  const sum = withData.reduce((acc, t) => acc + (t.mastery ?? 0), 0)
  return Math.round(sum / withData.length)
}
