/** Dades derivades de l'estat i del contingut, memoritzades on cal. */
import { useMemo } from 'react'
import { pack, useApp } from './store.tsx'
import { computeTopicMastery, globalMastery, type TopicMastery } from '../engines/mastery.ts'
import { countDue, countFailed } from '../engines/selection.ts'
import { toEpochDay } from '../util/date.ts'
import type { AnswerRecord, Question, SyllabusTopic } from '../domain/types.ts'

export function useToday(): number {
  return useMemo(() => toEpochDay(Date.now()), [])
}

/** Preguntes actives del municipi seleccionat. */
export function useActiveQuestions(): Question[] {
  return useMemo(() => pack.questions.filter((q) => q.status === 'active'), [])
}

export function useQuestionsById(): Map<string, Question> {
  return useMemo(() => new Map(pack.questions.map((q) => [q.questionId, q])), [])
}

export function useTopicsById(): Map<string, SyllabusTopic> {
  return useMemo(() => new Map(pack.syllabus.topics.map((t) => [t.topicId, t])), [])
}

export interface Dashboard {
  due: number
  failed: number
  answeredToday: number
  masteryByTopic: Map<string, TopicMastery>
  global: number | null
  /** Tema recomanat: el primer amb domini baix o sense practicar. */
  recommendedTopic: SyllabusTopic | null
}

export function useDashboard(): Dashboard {
  const { reviews, answers, progress } = useApp()
  const today = useToday()
  const active = useActiveQuestions()

  return useMemo(() => {
    const answersByTopic = new Map<string, AnswerRecord[]>()
    for (const a of answers) {
      const list = answersByTopic.get(a.topicId) ?? []
      list.push(a)
      answersByTopic.set(a.topicId, list)
    }

    const questionsByTopic = new Map<string, string[]>()
    for (const q of active) {
      const list = questionsByTopic.get(q.topicId) ?? []
      list.push(q.questionId)
      questionsByTopic.set(q.topicId, list)
    }

    const masteryByTopic = new Map<string, TopicMastery>()
    for (const topic of pack.syllabus.topics) {
      masteryByTopic.set(
        topic.topicId,
        computeTopicMastery({
          topicId: topic.topicId,
          questionIds: questionsByTopic.get(topic.topicId) ?? [],
          reviews,
          answers: answersByTopic.get(topic.topicId) ?? [],
          today,
        }),
      )
    }

    // Recomanació: el primer tema del temari encara sense dades; si tots en
    // tenen, el de domini més baix. Seguir l'ordre del temari evita saltar.
    const ordered = [...pack.syllabus.topics].sort((a, b) => a.number - b.number)
    let recommendedTopic: SyllabusTopic | null =
      ordered.find((t) => (masteryByTopic.get(t.topicId)?.answered ?? 0) === 0) ?? null
    if (!recommendedTopic) {
      recommendedTopic =
        ordered
          .slice()
          .sort(
            (a, b) =>
              (masteryByTopic.get(a.topicId)?.mastery ?? 0) -
              (masteryByTopic.get(b.topicId)?.mastery ?? 0),
          )[0] ?? null
    }

    return {
      due: countDue(active, reviews, today),
      failed: countFailed(active, reviews),
      // El comptador diari surt del progrés, no del registre de respostes:
      // és el mateix valor que governa la ratxa i el que es conserva en una
      // còpia de seguretat.
      answeredToday: progress.dailyCounts[String(today)] ?? 0,
      masteryByTopic,
      global: globalMastery([...masteryByTopic.values()]),
      recommendedTopic,
    }
  }, [active, answers, reviews, today, progress.dailyCounts])
}

/** Preguntes amb més errors acumulats, per a la pantalla de progrés. */
export function useRecurringErrors(limit = 5): Array<{ question: Question; lapses: number }> {
  const { reviews } = useApp()
  const byId = useQuestionsById()

  return useMemo(() => {
    const rows: Array<{ question: Question; lapses: number }> = []
    for (const [questionId, state] of reviews) {
      if (state.lapses < 2) continue
      const question = byId.get(questionId)
      if (question) rows.push({ question, lapses: state.lapses })
    }
    return rows.sort((a, b) => b.lapses - a.lapses).slice(0, limit)
  }, [reviews, byId, limit])
}

/** Comparació entre seguretat declarada i encert real. */
export interface ConfidenceStats {
  sureCorrect: number
  sureWrong: number
  unsureCorrect: number
  unsureWrong: number
  total: number
}

export function useConfidenceStats(): ConfidenceStats {
  const { answers } = useApp()
  return useMemo(() => {
    const stats: ConfidenceStats = {
      sureCorrect: 0, sureWrong: 0, unsureCorrect: 0, unsureWrong: 0, total: 0,
    }
    for (const a of answers) {
      if (a.confidence === null) continue
      stats.total++
      if (a.confidence === 'sure') {
        if (a.correct) stats.sureCorrect++
        else stats.sureWrong++
      } else if (a.correct) stats.unsureCorrect++
      else stats.unsureWrong++
    }
    return stats
  }, [answers])
}

/** Activitat diària dels últims `days` dies, per al calendari. */
export function useActivityCalendar(days = 35): Array<{ day: number; count: number }> {
  const { progress } = useApp()
  const today = useToday()
  return useMemo(() => {
    const out: Array<{ day: number; count: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const day = today - i
      out.push({ day, count: progress.dailyCounts[String(day)] ?? 0 })
    }
    return out
  }, [progress.dailyCounts, today, days])
}
