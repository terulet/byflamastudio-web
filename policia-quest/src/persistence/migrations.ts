/**
 * Migracions de dades de l'usuari.
 *
 * Regla inviolable: **actualitzar el contingut mai pot esborrar el progrés**.
 * Les migracions són idempotents (aplicar-les dues vegades dona el mateix
 * resultat) i sempre afegeixen camps amb valors per defecte, mai els eliminen
 * sense una migració explícita.
 */
import type { ExamAttempt, ReviewState, Settings, UserProgress } from '../domain/types.ts'

/** Versió actual de l'esquema de progrés persistit. */
export const PROGRESS_VERSION = 2

export const DEFAULT_SETTINGS: Settings = {
  explanationLang: 'ca',
  theme: 'dark',
  dailyGoal: 10,
  examDate: null,
  sound: false,
  haptics: true,
  reducedMotion: false,
  municipality: 'roses',
  onboarded: false,
}

export function defaultProgress(): UserProgress {
  return {
    progressVersion: PROGRESS_VERSION,
    xp: 0,
    streakDays: 0,
    longestStreak: 0,
    lastGoalDay: null,
    dailyCounts: {},
    totalAnswered: 0,
    totalCorrect: 0,
    totalStudyMs: 0,
    achievements: [],
  }
}

type UnknownRecord = Record<string, unknown>

/**
 * Migra un objecte de progrés de qualsevol versió anterior a l'actual.
 * Els camps desconeguts es conserven; els que falten reben el valor per defecte.
 */
export function migrateProgress(input: unknown): UserProgress {
  const base = defaultProgress()
  if (typeof input !== 'object' || input === null) return base

  const raw = input as UnknownRecord
  const from = typeof raw.progressVersion === 'number' ? raw.progressVersion : 1

  const merged: UserProgress = {
    ...base,
    xp: numberOr(raw.xp, base.xp),
    streakDays: numberOr(raw.streakDays, base.streakDays),
    longestStreak: numberOr(raw.longestStreak, base.longestStreak),
    lastGoalDay: typeof raw.lastGoalDay === 'number' ? raw.lastGoalDay : null,
    dailyCounts: isRecordOfNumbers(raw.dailyCounts) ? raw.dailyCounts : {},
    totalAnswered: numberOr(raw.totalAnswered, base.totalAnswered),
    totalCorrect: numberOr(raw.totalCorrect, base.totalCorrect),
    totalStudyMs: numberOr(raw.totalStudyMs, base.totalStudyMs),
    achievements: Array.isArray(raw.achievements)
      ? raw.achievements.filter((a): a is string => typeof a === 'string')
      : [],
    progressVersion: PROGRESS_VERSION,
  }

  // v1 → v2: `longestStreak` no existia; es derivava de la ratxa actual.
  if (from < 2 && merged.longestStreak < merged.streakDays) {
    merged.longestStreak = merged.streakDays
  }

  return merged
}

/** Migra els ajustos, conservant tot allò reconegut i descartant el brossa. */
export function migrateSettings(input: unknown): Settings {
  if (typeof input !== 'object' || input === null) return { ...DEFAULT_SETTINGS }
  const raw = input as UnknownRecord
  return {
    explanationLang: raw.explanationLang === 'es' ? 'es' : 'ca',
    theme:
      raw.theme === 'dark' || raw.theme === 'light' || raw.theme === 'system'
        ? raw.theme
        : DEFAULT_SETTINGS.theme,
    dailyGoal:
      raw.dailyGoal === 5 || raw.dailyGoal === 10 || raw.dailyGoal === 20
        ? raw.dailyGoal
        : DEFAULT_SETTINGS.dailyGoal,
    examDate: typeof raw.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.examDate)
      ? raw.examDate
      : null,
    sound: typeof raw.sound === 'boolean' ? raw.sound : DEFAULT_SETTINGS.sound,
    haptics: typeof raw.haptics === 'boolean' ? raw.haptics : DEFAULT_SETTINGS.haptics,
    reducedMotion:
      typeof raw.reducedMotion === 'boolean' ? raw.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    municipality: typeof raw.municipality === 'string' ? raw.municipality : 'roses',
    onboarded: typeof raw.onboarded === 'boolean' ? raw.onboarded : false,
  }
}

/**
 * Migra un estat de repàs. Els estats de preguntes que ja no existeixen al
 * contingut es conserven al magatzem: si la pregunta torna en una versió
 * futura, el progrés hi continua.
 */
export function migrateReviewState(input: unknown): ReviewState | null {
  if (typeof input !== 'object' || input === null) return null
  const raw = input as UnknownRecord
  if (typeof raw.questionId !== 'string') return null

  const phase = raw.phase
  return {
    questionId: raw.questionId,
    phase:
      phase === 'new' || phase === 'learning' || phase === 'review' || phase === 'mastered'
        ? phase
        : 'new',
    intervalStep: Math.max(0, numberOr(raw.intervalStep, 0)),
    dueDay: numberOr(raw.dueDay, 0),
    lapses: Math.max(0, numberOr(raw.lapses, 0)),
    reps: Math.max(0, numberOr(raw.reps, 0)),
    streak: Math.max(0, numberOr(raw.streak, 0)),
    ...(typeof raw.lastAnsweredDay === 'number' ? { lastAnsweredDay: raw.lastAnsweredDay } : {}),
    ...(isOutcome(raw.lastOutcome) ? { lastOutcome: raw.lastOutcome } : {}),
    flagged: typeof raw.flagged === 'boolean' ? raw.flagged : false,
  }
}

/**
 * Migra un intent de simulacre.
 *
 * Els intents anteriors a la introducció del simulacre complet no tenien
 * seccions: se'n deriva una de sola a partir del plànol i de la durada, de
 * manera que un simulacre a mitges d'abans es pot reprendre igualment.
 */
export function migrateExamAttempt(input: unknown): ExamAttempt | null {
  if (typeof input !== 'object' || input === null) return null
  const raw = input as UnknownRecord
  if (typeof raw.attemptId !== 'string') return null
  if (!Array.isArray(raw.blueprintIds) || raw.blueprintIds.length === 0) return null
  if (!Array.isArray(raw.questionIds)) return null

  const questionIds = raw.questionIds.filter((x): x is string => typeof x === 'string')
  const durationMs = Math.max(1, numberOr(raw.durationMs, 60_000))
  const elapsedMsAtPause = Math.max(0, numberOr(raw.elapsedMsAtPause, 0))

  const storedSections = Array.isArray(raw.sections) ? raw.sections : []
  const sections: ExamAttempt['sections'] =
    storedSections.length > 0
      ? storedSections.flatMap((entry) => {
          if (typeof entry !== 'object' || entry === null) return []
          const section = entry as UnknownRecord
          if (typeof section.blueprintId !== 'string') return []
          const count = Math.max(1, numberOr(section.count, questionIds.length))
          return [{
            blueprintId: section.blueprintId,
            count,
            durationMs: Math.max(1, numberOr(section.durationMs, durationMs)),
            elapsedMs: Math.max(0, numberOr(section.elapsedMs, 0)),
            finished: typeof section.finished === 'boolean' ? section.finished : false,
          }]
        })
      : [{
          blueprintId: String(raw.blueprintIds[0]),
          count: Math.max(1, questionIds.length),
          durationMs,
          elapsedMs: elapsedMsAtPause,
          finished: raw.status === 'finished',
        }]

  const status = raw.status
  return {
    attemptId: raw.attemptId,
    blueprintIds: raw.blueprintIds.filter((x): x is string => typeof x === 'string'),
    ...(typeof raw.officialExamId === 'string' ? { officialExamId: raw.officialExamId } : {}),
    ...(typeof raw.compositionId === 'string' ? { compositionId: raw.compositionId } : {}),
    questionIds,
    responses: questionIds.map((_, i) => {
      const value = Array.isArray(raw.responses) ? raw.responses[i] : null
      return value === 'a' || value === 'b' || value === 'c' || value === 'd' ? value : null
    }),
    flagged: questionIds.map((_, i) =>
      Array.isArray(raw.flagged) ? raw.flagged[i] === true : false,
    ),
    startedAt: numberOr(raw.startedAt, 0),
    durationMs,
    elapsedMsAtPause,
    sections,
    currentSection: Math.min(
      Math.max(0, numberOr(raw.currentSection, 0)),
      Math.max(0, sections.length - 1),
    ),
    status:
      status === 'in-progress' || status === 'finished' || status === 'abandoned'
        ? status
        : 'abandoned',
    ...(typeof raw.finishedAt === 'number' ? { finishedAt: raw.finishedAt } : {}),
    ...(typeof raw.scoreMilli === 'number' ? { scoreMilli: raw.scoreMilli } : {}),
    sectionScoresMilli: Array.isArray(raw.sectionScoresMilli)
      ? raw.sectionScoresMilli.filter((x): x is number => typeof x === 'number')
      : [],
    currentIndex: Math.max(0, numberOr(raw.currentIndex, 0)),
  }
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function isRecordOfNumbers(value: unknown): value is Record<string, number> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every((v) => typeof v === 'number')
}

function isOutcome(value: unknown): value is ReviewState['lastOutcome'] {
  return (
    value === 'correct-sure' ||
    value === 'correct-unsure' ||
    value === 'wrong' ||
    value === 'dont-know'
  )
}
