/**
 * Estat global de l'aplicació.
 *
 * Un sol context amb l'estat de l'usuari (ajustos, progrés, repassos,
 * respostes, sessions i intents) i les accions que el modifiquen. Cada acció
 * actualitza l'estat en memòria i persisteix a IndexedDB en paral·lel, de
 * manera que la interfície mai espera el disc.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AnswerRecord,
  ExamAttempt,
  Outcome,
  Question,
  ReviewState,
  Settings,
  StudySession,
  UserProgress,
} from '../domain/types.ts'
import { pack as packCore } from '../content/index.ts'
import { applyOutcome, getOrInit } from '../engines/srs.ts'
import { toEpochDay } from '../util/date.ts'
import {
  appendAnswers,
  clearAllProgress,
  loadAnswers,
  loadAttempts,
  loadProgress,
  loadReviews,
  loadSessions,
  loadSettings,
  restoreBackup,
  saveAttempt as persistAttempt,
  saveProgress,
  saveReviews,
  saveSession as persistSession,
  saveSettings,
} from '../persistence/db.ts'
import { defaultProgress, DEFAULT_SETTINGS } from '../persistence/migrations.ts'

/* ---------------- XP i nivells ---------------- */

/** XP per resultat. Es guanya per estudiar de veritat, no per obrir pantalles. */
export const XP_BY_OUTCOME: Record<Outcome, number> = {
  'correct-sure': 10,
  'correct-unsure': 6,
  wrong: 3,
  'dont-know': 2,
}

export const LEVELS = [
  { id: 'aspirant', minXp: 0 },
  { id: 'academia', minXp: 500 },
  { id: 'preparacio', minXp: 1_500 },
  { id: 'patrulla', minXp: 3_500 },
  { id: 'agent', minXp: 7_000 },
] as const

export type LevelId = (typeof LEVELS)[number]['id']

export function levelFor(xp: number): { id: LevelId; index: number; nextXp: number | null } {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]!.minXp) index = i
  }
  const next = LEVELS[index + 1]
  return { id: LEVELS[index]!.id, index, nextXp: next ? next.minXp : null }
}

/* ---------------- Context ---------------- */

export interface AppState {
  ready: boolean
  settings: Settings
  progress: UserProgress
  reviews: Map<string, ReviewState>
  answers: AnswerRecord[]
  sessions: StudySession[]
  attempts: ExamAttempt[]
}

export interface AppActions {
  updateSettings: (patch: Partial<Settings>) => void
  recordAnswer: (input: {
    question: Question
    outcome: Outcome
    chosen: 'a' | 'b' | 'c' | 'd' | null
    msSpent: number
    /** El que la persona va marcar al selector, o null si no el va tocar. */
    confidence: 'sure' | 'unsure' | null
  }) => void
  toggleFlag: (questionId: string) => void
  sendToReview: (questionIds: readonly string[]) => void
  saveSession: (session: StudySession) => void
  saveAttempt: (attempt: ExamAttempt) => void
  resetProgress: () => Promise<void>
  applyBackup: (payload: {
    settings: Settings
    progress: UserProgress
    reviews: ReviewState[]
    sessions: StudySession[]
    attempts: ExamAttempt[]
  }) => Promise<void>
}

const StateContext = createContext<AppState | null>(null)
const ActionsContext = createContext<AppActions | null>(null)

export function useApp(): AppState {
  const value = useContext(StateContext)
  if (!value) throw new Error('useApp fora del proveïdor')
  return value
}

export function useActions(): AppActions {
  const value = useContext(ActionsContext)
  if (!value) throw new Error('useActions fora del proveïdor')
  return value
}

/** El contingut és estàtic: no cal que passi per l'estat reactiu. */
export const pack = packCore

/* ---------------- Assoliments ---------------- */

function computeAchievements(
  progress: UserProgress,
  reviews: Map<string, ReviewState>,
  attempts: readonly ExamAttempt[],
): string[] {
  const earned = new Set(progress.achievements)

  if (progress.totalAnswered >= 1) earned.add('primera-sessio')
  if (progress.totalAnswered >= 100) earned.add('cent-preguntes')
  if (progress.streakDays >= 7 || progress.longestStreak >= 7) earned.add('ratxa-7')
  if (progress.streakDays >= 30 || progress.longestStreak >= 30) earned.add('ratxa-30')

  // Errors recuperats: preguntes fallades alguna vegada i ara dominades.
  let recovered = 0
  for (const state of reviews.values()) {
    if (state.lapses > 0 && state.phase === 'mastered') recovered++
  }
  if (recovered >= 10) earned.add('errors-recuperats')

  if (attempts.some((a) => a.status === 'finished' && (a.scoreMilli ?? -1) >= 10_000)) {
    earned.add('simulacre-aprovat')
  }

  // Bloc dominat: tots els temes d'un bloc amb almenys una pregunta dominada.
  const masteredTopics = new Set<string>()
  for (const [questionId, state] of reviews) {
    if (state.phase !== 'mastered') continue
    const q = pack.questions.find((x) => x.questionId === questionId)
    if (q) masteredTopics.add(q.topicId)
  }
  const blocks = new Map<string, string[]>()
  for (const topic of pack.syllabus.topics) {
    const list = blocks.get(topic.block) ?? []
    list.push(topic.topicId)
    blocks.set(topic.block, list)
  }
  for (const topics of blocks.values()) {
    if (topics.every((t) => masteredTopics.has(t))) {
      earned.add('bloc-dominat')
      break
    }
  }

  return [...earned].sort()
}

/* ---------------- Proveïdor ---------------- */

export function AppProvider({ children }: { children: ReactNode }): ReactNode {
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [progress, setProgress] = useState<UserProgress>(defaultProgress)
  const [reviews, setReviews] = useState<Map<string, ReviewState>>(new Map())
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])

  /**
   * Respostes i estats de repàs acumulats entre escriptures.
   *
   * S'escriuen immediatament després de cada resposta, no amb retard: una
   * finestra de mig segon n'hi ha prou perquè tancar l'app just després de
   * contestar perdi la resposta, i estalviar aquesta escriptura no compensa.
   * El buidat en `pagehide` queda com a xarxa de seguretat.
   */
  const pendingAnswers = useRef<AnswerRecord[]>([])
  const pendingReviews = useRef<ReviewState[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const loadedSettings = loadSettings()
      const [loadedProgress, loadedReviews, loadedAnswers, loadedSessions, loadedAttempts] =
        await Promise.all([
          loadProgress(),
          loadReviews(),
          loadAnswers(),
          loadSessions(),
          loadAttempts(),
        ])
      if (cancelled) return
      setSettings(loadedSettings)
      setProgress(loadedProgress)
      setReviews(loadedReviews)
      setAnswers(loadedAnswers)
      setSessions(loadedSessions)
      setAttempts(loadedAttempts)
      setReady(true)
    })().catch(() => {
      // Si IndexedDB no és accessible, l'app arrenca igualment en memòria.
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const flush = useCallback(() => {
    const answersToWrite = pendingAnswers.current
    const reviewsToWrite = pendingReviews.current
    pendingAnswers.current = []
    pendingReviews.current = []
    if (answersToWrite.length > 0) void appendAnswers(answersToWrite)
    if (reviewsToWrite.length > 0) void saveReviews(reviewsToWrite)
  }, [])

  // Cap resposta es perd si l'usuari tanca la pestanya de cop.
  useEffect(() => {
    const onHide = (): void => flush()
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flush])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const recordAnswer = useCallback<AppActions['recordAnswer']>(
    ({ question, outcome, chosen, msSpent, confidence }) => {
      const now = Date.now()
      const today = toEpochDay(now)
      const isCorrect = outcome === 'correct-sure' || outcome === 'correct-unsure'

      const record: AnswerRecord = {
        questionId: question.questionId,
        topicId: question.topicId,
        chosen,
        correct: isCorrect,
        dontKnow: outcome === 'dont-know',
        // La confiança desada és la que la persona va marcar de debò, també
        // quan falla. Abans es deduïa del resultat, i això tenia dues mentides
        // dins: un encert sense tocar el selector comptava com a «segur», i un
        // error mai duia confiança, de manera que «segur però incorrecte» —el
        // senyal que el panell de progrés promet— no podia passar de zero.
        confidence,
        msSpent,
        answeredAt: now,
      }

      setReviews((current) => {
        const nextState = applyOutcome(getOrInit(current, question.questionId), outcome, today)
        const next = new Map(current)
        next.set(question.questionId, nextState)
        pendingReviews.current.push(nextState)
        return next
      })

      setAnswers((current) => [...current, record])
      pendingAnswers.current.push(record)

      setProgress((current) => {
        const dayKey = String(today)
        const answeredToday = (current.dailyCounts[dayKey] ?? 0) + 1
        const goalMet = answeredToday >= settings.dailyGoal

        let streakDays = current.streakDays
        let lastGoalDay = current.lastGoalDay
        if (goalMet && current.lastGoalDay !== today) {
          streakDays = current.lastGoalDay === today - 1 ? current.streakDays + 1 : 1
          lastGoalDay = today
        }

        const next: UserProgress = {
          ...current,
          xp: current.xp + XP_BY_OUTCOME[outcome],
          dailyCounts: { ...current.dailyCounts, [dayKey]: answeredToday },
          totalAnswered: current.totalAnswered + 1,
          totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
          totalStudyMs: current.totalStudyMs + msSpent,
          streakDays,
          longestStreak: Math.max(current.longestStreak, streakDays),
          lastGoalDay,
        }
        void saveProgress(next)
        return next
      })

      flush()
    },
    [flush, settings.dailyGoal],
  )

  const toggleFlag = useCallback((questionId: string) => {
    setReviews((current) => {
      const state = getOrInit(current, questionId)
      const next = new Map(current)
      const updated = { ...state, flagged: !state.flagged }
      next.set(questionId, updated)
      void saveReviews([updated])
      return next
    })
  }, [])

  const sendToReview = useCallback((questionIds: readonly string[]) => {
    if (questionIds.length === 0) return
    setReviews((current) => {
      const next = new Map(current)
      const updated: ReviewState[] = []
      for (const id of questionIds) {
        const state = getOrInit(current, id)
        const flagged = { ...state, flagged: true }
        next.set(id, flagged)
        updated.push(flagged)
      }
      void saveReviews(updated)
      return next
    })
  }, [])

  const saveSession = useCallback((session: StudySession) => {
    setSessions((current) => {
      const rest = current.filter((s) => s.sessionId !== session.sessionId)
      return [session, ...rest]
    })
    void persistSession(session)
  }, [])

  const saveAttempt = useCallback((attempt: ExamAttempt) => {
    setAttempts((current) => {
      const rest = current.filter((a) => a.attemptId !== attempt.attemptId)
      return [attempt, ...rest].sort((a, b) => b.startedAt - a.startedAt)
    })
    void persistAttempt(attempt)
  }, [])

  const resetProgress = useCallback(async () => {
    await clearAllProgress()
    setProgress(defaultProgress())
    setReviews(new Map())
    setAnswers([])
    setSessions([])
    setAttempts([])
  }, [])

  const applyBackup = useCallback<AppActions['applyBackup']>(async (payload) => {
    await restoreBackup(payload)
    setSettings(payload.settings)
    setProgress(payload.progress)
    setReviews(new Map(payload.reviews.map((r) => [r.questionId, r])))
    setSessions(payload.sessions)
    setAttempts(payload.attempts)
    const reloaded = await loadAnswers()
    setAnswers(reloaded)
  }, [])

  // Els assoliments es recalculen quan canvia alguna cosa que els pot afectar.
  useEffect(() => {
    if (!ready) return
    const earned = computeAchievements(progress, reviews, attempts)
    if (earned.length !== progress.achievements.length) {
      setProgress((current) => {
        const next = { ...current, achievements: earned }
        void saveProgress(next)
        return next
      })
    }
  }, [ready, progress, reviews, attempts])

  const state = useMemo<AppState>(
    () => ({ ready, settings, progress, reviews, answers, sessions, attempts }),
    [ready, settings, progress, reviews, answers, sessions, attempts],
  )

  const actions = useMemo<AppActions>(
    () => ({
      updateSettings,
      recordAnswer,
      toggleFlag,
      sendToReview,
      saveSession,
      saveAttempt,
      resetProgress,
      applyBackup,
    }),
    [
      updateSettings, recordAnswer, toggleFlag, sendToReview,
      saveSession, saveAttempt, resetProgress, applyBackup,
    ],
  )

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </StateContext.Provider>
  )
}
