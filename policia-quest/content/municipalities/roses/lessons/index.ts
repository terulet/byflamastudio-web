/** Totes les microlliçons del paquet de Roses, en ordre de tema. */
import type { Lesson } from '../../../schemas/index.ts'
import { LESSONS_1_5 } from './block-1a.ts'
import { LESSONS_6_10 } from './block-1b.ts'
import { LESSONS_11_15 } from './block-1c.ts'
import { LESSONS_16_20 } from './block-1d.ts'
import { LESSONS_21_25 } from './block-2a.ts'
import { LESSONS_26_30 } from './block-2b.ts'
import { LESSONS_31_36 } from './block-3.ts'
import { LESSONS_37_40 } from './block-4.ts'

export const ROSES_LESSONS: Lesson[] = [
  ...LESSONS_1_5,
  ...LESSONS_6_10,
  ...LESSONS_11_15,
  ...LESSONS_16_20,
  ...LESSONS_21_25,
  ...LESSONS_26_30,
  ...LESSONS_31_36,
  ...LESSONS_37_40,
]
