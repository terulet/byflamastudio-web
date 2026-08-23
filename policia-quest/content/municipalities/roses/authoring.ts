/**
 * Ajudes per redactar contingut de manera compacta i tipada.
 *
 * El contingut s'escriu en TypeScript, no en JSON pla, per tres motius:
 *  1. L'editor comprova els tipus mentre s'escriu (una referència a una font
 *     inexistent o una opció que falta es veu a l'instant).
 *  2. `npm run typecheck` ja valida l'estructura abans que s'executi cap test.
 *  3. Es poden fer servir helpers com `ref()` sense repetir camps.
 *
 * La validació semàntica completa (cobertura, duplicats, referències
 * resolubles) la fa `scripts/validate-content.ts` amb els esquemes Zod.
 */
import type { Lesson, LessonCard, Question, SourceReference } from '../../schemas/index.ts'

/** Data de redacció d'aquesta tanda de contingut. */
export const AUTHORED_AT = '2026-08-23'

/**
 * Estat de revisió per defecte de tot el contingut d'aquesta primera versió.
 *
 * `pending-source-verification` vol dir: la referència és a una norma real i
 * concreta, però l'entorn de construcció no va poder baixar el text consolidat
 * per contrastar-la automàticament. Vegeu `environmentNotes` a
 * sources/source-manifest.json i l'informe de cobertura.
 *
 * Quan `npm run sources:download` s'executi en una xarxa amb accés i
 * `validate-content.ts` contrasti les cites, aquest valor passarà a `verified`.
 */
export const DEFAULT_REVIEW_STATUS = 'pending-source-verification' as const

/** Crea una referència a una font registrada. */
export function ref(sourceId: string, locator: string, note?: string): SourceReference {
  return {
    sourceId,
    locator,
    validAt: AUTHORED_AT,
    reviewStatus: DEFAULT_REVIEW_STATUS,
    ...(note ? { note } : {}),
  }
}

/* ---------------- Targetes de lliçó ---------------- */

export const idea = (ca: string, es: string, titleCa = 'Idea clau', titleEs = 'Idea clave'): LessonCard => ({
  kind: 'idea', title: { ca: titleCa, es: titleEs }, body: { ca, es },
})

export const explain = (titleCa: string, titleEs: string, ca: string, es: string): LessonCard => ({
  kind: 'explanation', title: { ca: titleCa, es: titleEs }, body: { ca, es },
})

export const example = (ca: string, es: string, titleCa = 'Exemple pràctic', titleEs = 'Ejemplo práctico'): LessonCard => ({
  kind: 'example', title: { ca: titleCa, es: titleEs }, body: { ca, es },
})

export const pitfall = (ca: string, es: string, titleCa = 'Sol confondre', titleEs = 'Suele confundir'): LessonCard => ({
  kind: 'pitfall', title: { ca: titleCa, es: titleEs }, body: { ca, es },
})

export const checkpoint = (promptCa: string, promptEs: string, answerCa: string, answerEs: string): LessonCard => ({
  kind: 'checkpoint',
  title: { ca: 'Comprovació ràpida', es: 'Comprobación rápida' },
  prompt: { ca: promptCa, es: promptEs },
  answer: { ca: answerCa, es: answerEs },
})

export function compare(
  titleCa: string, titleEs: string,
  leftCa: string, leftEs: string,
  rightCa: string, rightEs: string,
  rows: Array<[string, string, string, string, string, string]>,
): LessonCard {
  return {
    kind: 'compare',
    title: { ca: titleCa, es: titleEs },
    leftHeader: { ca: leftCa, es: leftEs },
    rightHeader: { ca: rightCa, es: rightEs },
    rows: rows.map(([lCa, lEs, aCa, aEs, bCa, bEs]) => ({
      label: { ca: lCa, es: lEs },
      left: { ca: aCa, es: aEs },
      right: { ca: bCa, es: bEs },
    })),
  }
}

/** Construeix una lliçó completa a partir del número de tema. */
export function lesson(
  topicNumber: number,
  titleCa: string,
  titleEs: string,
  minutes: number,
  cards: LessonCard[],
  references: SourceReference[],
): Lesson {
  const topicId = topicIdFor(topicNumber)
  return {
    lessonId: `${topicId}-l1`,
    topicId,
    title: { ca: titleCa, es: titleEs },
    minutes,
    cards,
    references,
    updatedAt: AUTHORED_AT,
  }
}

export function topicIdFor(topicNumber: number): string {
  return `roses-t${String(topicNumber).padStart(2, '0')}`
}

/* ---------------- Preguntes ---------------- */

export interface QuestionSpec {
  /** Número correlatiu dins el tema (1, 2, 3…). */
  n: number
  stem: string
  /** Les quatre opcions en ordre a, b, c, d. */
  options: [string, string, string, string]
  correct: 'a' | 'b' | 'c' | 'd'
  /** Per què fallen les altres. Clau = lletra de l'opció. */
  whyWrong?: Partial<Record<'a' | 'b' | 'c' | 'd', string>>
  explainCa: string
  explainEs: string
  refs: SourceReference[]
  difficulty?: 'facil' | 'mitjana' | 'dificil'
  track?: 'cultura-general' | 'coneixements-professionals'
  tags?: string[]
  dynamic?: boolean
  reviewBy?: string
}

/** Converteix les especificacions compactes d'un tema en preguntes completes. */
export function questionsFor(topicNumber: number, specs: QuestionSpec[]): Question[] {
  const topicId = topicIdFor(topicNumber)
  return specs.map((spec) => {
    const letters = ['a', 'b', 'c', 'd'] as const
    return {
      questionId: `q-${topicId}-${String(spec.n).padStart(3, '0')}`,
      topicId,
      track: spec.track ?? 'coneixements-professionals',
      origin: 'authored' as const,
      status: 'active' as const,
      difficulty: spec.difficulty ?? 'mitjana',
      stem: spec.stem,
      options: letters.map((letter, i) => {
        const whyWrong = letter === spec.correct ? undefined : spec.whyWrong?.[letter]
        return {
          optionId: letter,
          text: spec.options[i]!,
          ...(whyWrong ? { whyWrong } : {}),
        }
      }),
      correct: spec.correct,
      explanation: { ca: spec.explainCa, es: spec.explainEs },
      references: spec.refs,
      dynamic: spec.dynamic ?? false,
      ...(spec.reviewBy ? { reviewBy: spec.reviewBy } : {}),
      tags: spec.tags ?? [],
    }
  })
}
