/**
 * Banc de preguntes complet del paquet de Roses.
 *
 * Les preguntes d'examen oficial hi entren amb el seu **judici probatori**
 * enganxat: quin estat temporal té la plantilla del tribunal, quina norma la
 * sosté i què n'ha canviat. El judici viu a `official-evidence-map.json`, que és
 * la font única, i s'adjunta aquí perquè tothom qui vegi una pregunta vegi la
 * mateixa decisió. Duplicar-lo als fitxers de contingut seria crear una segona
 * versió que se separaria de la primera el primer dia que algú en toqués una.
 */
import type { Question } from '../../../schemas/index.ts'
import evidenceMap from './official-evidence-map.json' with { type: 'json' }
import { QUESTIONS_01_05 } from './topics-01-05.ts'
import { QUESTIONS_06_10 } from './topics-06-10.ts'
import { QUESTIONS_11_15 } from './topics-11-15.ts'
import { QUESTIONS_16_20 } from './topics-16-20.ts'
import { QUESTIONS_21_25 } from './topics-21-25.ts'
import { QUESTIONS_26_30 } from './topics-26-30.ts'
import { QUESTIONS_31_36 } from './topics-31-36.ts'
import { QUESTIONS_37_40 } from './topics-37-40.ts'
import { QUESTIONS_CULTURA_GENERAL } from './cultura-general.ts'
import { OFFICIAL_EXAM_QUESTIONS } from './official-exams.ts'
import { CURRENT_AFFAIRS_QUESTIONS } from '../current-affairs/questions-2026-08.ts'

type Evidence = NonNullable<NonNullable<Question['officialExam']>['evidence']>
const EVIDENCE = evidenceMap.decisions as unknown as Record<string, Evidence>

/** Enganxa el judici probatori a cada pregunta oficial. */
function withEvidence(questions: readonly Question[]): Question[] {
  return questions.map((q) => {
    if (!q.officialExam) return q
    const evidence = EVIDENCE[q.questionId]
    return evidence ? { ...q, officialExam: { ...q.officialExam, evidence } } : q
  })
}

export const ROSES_QUESTIONS: Question[] = [
  ...QUESTIONS_01_05,
  ...QUESTIONS_06_10,
  ...QUESTIONS_11_15,
  ...QUESTIONS_16_20,
  ...QUESTIONS_21_25,
  ...QUESTIONS_26_30,
  ...QUESTIONS_31_36,
  ...QUESTIONS_37_40,
  ...QUESTIONS_CULTURA_GENERAL,
  ...withEvidence(OFFICIAL_EXAM_QUESTIONS),
  ...CURRENT_AFFAIRS_QUESTIONS,
]
