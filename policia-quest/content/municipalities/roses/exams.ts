/**
 * Registre d'exàmens oficials i plànols de simulacre de Roses.
 *
 * Els plànols (`ExamBlueprint`) codifiquen les regles reals de la convocatòria
 * i són la font única de veritat per al motor de puntuació.
 *
 * El registre d'exàmens (`OfficialExam`) llista els quadernets publicats pel
 * tribunal amb la seva URL real. `importStatus: 'pending-source'` vol dir que
 * el document existeix i està identificat, però que no s'ha pogut baixar per
 * transcriure'l. Mai s'inventa el contingut d'un examen.
 */
import type { ExamBlueprint, ExamComposition, OfficialExam } from '../../schemas/index.ts'
import { CONEIXEMENTS_SCORING, CULTURA_GENERAL_SCORING } from '../../../src/engines/scoring.ts'

const PENDING_NOTE =
  'Quadernet no importat: l’entorn de construcció (2026-08-23) no va poder accedir a www.roses.cat ' +
  '(CONNECT 403 de la política d’eixida de xarxa). Executeu `npm run sources:download` i ' +
  '`npm run exams:import` des d’una xarxa amb accés per completar la transcripció.'

export const ROSES_BLUEPRINTS: ExamBlueprint[] = [
  {
    blueprintId: 'roses-cultura-general',
    title: {
      ca: 'Simulacre de cultura general',
      es: 'Simulacro de cultura general',
    },
    track: 'cultura-general',
    questionCount: 20,
    durationMinutes: 20,
    reserveCount: 1,
    scoring: CULTURA_GENERAL_SCORING,
    composition: [
      { label: { ca: 'Cultura general', es: 'Cultura general' }, tag: 'cultura-general', count: 10 },
      { label: { ca: 'Actualitat social, cultural i política', es: 'Actualidad social, cultural y política' }, tag: 'actualitat', count: 10 },
    ],
    sourceId: 'roses-bases-2026-interins',
  },
  {
    blueprintId: 'roses-coneixements-professionals',
    title: {
      ca: 'Simulacre de coneixements professionals',
      es: 'Simulacro de conocimientos profesionales',
    },
    track: 'coneixements-professionals',
    questionCount: 40,
    durationMinutes: 60,
    reserveCount: 2,
    scoring: CONEIXEMENTS_SCORING,
    sourceId: 'roses-bases-2026-interins',
  },
]

/**
 * Simulacre complet: les dues proves seguides, com el dia de l'examen.
 *
 * No és un plànol nou sinó la composició dels dos que ja hi ha. Cada prova
 * conserva el seu temps i les seves regles, i el veredicte final exigeix
 * aprovar-les totes dues, no que la mitjana doni 10.
 */
export const ROSES_COMPOSITIONS: ExamComposition[] = [
  {
    compositionId: 'roses-simulacre-complet',
    title: { ca: 'Simulacre complet', es: 'Simulacro completo' },
    subtitle: {
      ca: 'Cultura general seguida de coneixements professionals',
      es: 'Cultura general seguida de conocimientos profesionales',
    },
    blueprintIds: ['roses-cultura-general', 'roses-coneixements-professionals'],
    sourceId: 'roses-bases-2026-interins',
  },
]

/** Els quatre exàmens de prioritat P0 exigits per la convocatòria vigent. */
const P0: OfficialExam[] = [
  {
    examId: 'roses-2025-propietat-cg',
    municipality: 'roses',
    year: 2025,
    placeType: 'propietat',
    testType: 'cultura-general',
    heldOn: '2025-12-03',
    url: 'https://www.roses.cat/fitxers/RRHH/proves-opos/agents-policia-local-en-propietat-2025_c1_prova-cultura-general_03122025-1',
    sourceId: 'roses-examen-2025-propietat-cg',
    priority: 'P0',
    importStatus: 'pending-source',
    questionIds: [],
    expectedQuestionCount: 20,
    note: PENDING_NOTE,
  },
  {
    examId: 'roses-2025-propietat-cp',
    municipality: 'roses',
    year: 2025,
    placeType: 'propietat',
    testType: 'coneixements-professionals',
    heldOn: '2025-12-03',
    url: 'https://www.roses.cat/fitxers/RRHH/proves-opos/agents-policia-local-en-propietat-2025_c1_prova-coneixements-professionals_03122025',
    sourceId: 'roses-examen-2025-propietat-cp',
    priority: 'P0',
    importStatus: 'pending-source',
    questionIds: [],
    expectedQuestionCount: 40,
    note: PENDING_NOTE,
  },
  {
    examId: 'roses-2026-interins-cg',
    municipality: 'roses',
    year: 2026,
    placeType: 'interina',
    testType: 'cultura-general',
    heldOn: '2026-04-15',
    url: 'https://www.roses.cat/fitxers/RRHH/proves-opos/agents-policia-local-interina-2026_c1_prova-cultura-general_15042026',
    sourceId: 'roses-examen-2026-interins-cg',
    priority: 'P0',
    importStatus: 'pending-source',
    questionIds: [],
    expectedQuestionCount: 20,
    note: PENDING_NOTE,
  },
  {
    examId: 'roses-2026-interins-cp',
    municipality: 'roses',
    year: 2026,
    placeType: 'interina',
    testType: 'coneixements-professionals',
    heldOn: '2026-04-15',
    url: 'https://www.roses.cat/fitxers/RRHH/proves-opos/agents-policia-local-interins-2026_c1_prova-coneixements-professionals_15042026',
    sourceId: 'roses-examen-2026-interins-cp',
    priority: 'P0',
    importStatus: 'pending-source',
    questionIds: [],
    expectedQuestionCount: 40,
    note: PENDING_NOTE,
  },
]

/**
 * Exàmens de prioritat P1: convocatòries anteriors publicades a l'arxiu
 * municipal. No en coneixem la URL directa de cada fitxer perquè l'índex no
 * era accessible; s'apunta a la pàgina d'arxiu, que és on es publiquen.
 * Inventar URL de fitxer seria fabricar una font.
 */
const ARCHIVE_URL =
  'https://www.roses.cat/ajuntament/informacio-administrativa/oferta-publica-docupacio/examens-1'

const P1_NOTE =
  'Convocatòria anterior llistada a l’arxiu municipal d’exàmens. Ni l’índex ni el fitxer es van ' +
  'poder consultar des de l’entorn de construcció, de manera que no se’n coneix la URL directa ni ' +
  'el nombre exacte de preguntes. Cal resoldre-ho amb `npm run sources:download`.'

function p1(year: number, placeType: 'propietat' | 'interina'): OfficialExam[] {
  return (['cultura-general', 'coneixements-professionals'] as const).map((testType) => ({
    examId: `roses-${year}-${placeType}-${testType === 'cultura-general' ? 'cg' : 'cp'}`,
    municipality: 'roses',
    year,
    placeType,
    testType,
    url: ARCHIVE_URL,
    sourceId: 'roses-arxiu-examens',
    priority: 'P1' as const,
    importStatus: 'pending-source' as const,
    questionIds: [],
    note: P1_NOTE,
  }))
}

const P1: OfficialExam[] = [
  ...[2018, 2019, 2021, 2024].flatMap((y) => p1(y, 'propietat')),
  ...[2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025].flatMap((y) => p1(y, 'interina')),
]

export const ROSES_EXAMS: OfficialExam[] = [...P0, ...P1]
