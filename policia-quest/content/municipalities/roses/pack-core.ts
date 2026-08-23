/**
 * Nucli del paquet de Roses: tot allò que l'aplicació necessita des del primer
 * instant (temari, banc de preguntes, exàmens, plànols, actualitat i fonts).
 *
 * Les microlliçons **no** hi són. Pesen prop de 200 kB i només calen en obrir
 * un tema, de manera que es carreguen a part amb `loadLessons()`. Això treu
 * gairebé el 40 % del paquet inicial sense afectar cap altra pantalla.
 */
import type { ContentVersion, MunicipalityPack, Source, Syllabus } from '../../schemas/index.ts'
import syllabusJson from './syllabus.json' with { type: 'json' }
import manifestJson from '../../../sources/source-manifest.json' with { type: 'json' }
import { ROSES_QUESTIONS } from './questions/index.ts'
import { ROSES_EXAMS, ROSES_BLUEPRINTS, ROSES_COMPOSITIONS } from './exams.ts'
import { ROSES_CURRENT_AFFAIRS } from './current-affairs/index.ts'

export const ROSES_VERSION: ContentVersion = {
  schemaVersion: 1,
  packVersion: 1,
  builtAt: '2026-08-23',
}

export const ROSES_SOURCES = manifestJson.sources as Source[]
export const ROSES_SYLLABUS = syllabusJson as Syllabus

/** Paquet sense lliçons: la forma que consumeix la interfície. */
export type PackCore = Omit<MunicipalityPack, 'lessons'>

export const ROSES_PACK_CORE: PackCore = {
  municipality: 'roses',
  name: { ca: 'Roses', es: 'Roses' },
  subtitle: {
    ca: 'Preparació Policia Local · Roses',
    es: 'Preparación Policía Local · Roses',
  },
  version: ROSES_VERSION,
  syllabus: ROSES_SYLLABUS,
  questions: ROSES_QUESTIONS,
  exams: ROSES_EXAMS,
  blueprints: ROSES_BLUEPRINTS,
  compositions: ROSES_COMPOSITIONS,
  currentAffairs: ROSES_CURRENT_AFFAIRS,
  sources: ROSES_SOURCES,
}

export { ROSES_QUESTIONS, ROSES_EXAMS, ROSES_BLUEPRINTS, ROSES_COMPOSITIONS, ROSES_CURRENT_AFFAIRS }
