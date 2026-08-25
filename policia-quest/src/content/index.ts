/**
 * Punt d'entrada del contingut per a l'aplicació.
 *
 * Exposa el nucli de manera síncrona i les microlliçons amb una importació
 * dinàmica, perquè no entrin al paquet inicial.
 */
import type { Lesson } from '../domain/types.ts'

export {
  ROSES_PACK_CORE as pack,
  ROSES_VERSION,
  ROSES_SOURCES,
  ROSES_SYLLABUS,
  ROSES_QUESTIONS,
  ROSES_EXAMS,
  ROSES_BLUEPRINTS,
  ROSES_CURRENT_AFFAIRS,
  type PackCore,
} from '../../content/municipalities/roses/pack-core.ts'

let cached: Lesson[] | null = null

/** Carrega les microlliçons sota demanda i les recorda per a les crides següents. */
export async function loadLessons(): Promise<Lesson[]> {
  if (cached) return cached
  const module = await import('../../content/municipalities/roses/lessons/index.ts')
  cached = module.ROSES_LESSONS
  return cached
}

/** Lliçó d'un tema concret. */
export async function loadLesson(topicId: string): Promise<Lesson | null> {
  const lessons = await loadLessons()
  return lessons.find((l) => l.topicId === topicId) ?? null
}
