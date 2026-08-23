/** Banc de preguntes complet del paquet de Roses. */
import type { Question } from '../../../schemas/index.ts'
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
  ...OFFICIAL_EXAM_QUESTIONS,
]
