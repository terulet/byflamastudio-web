/**
 * Preguntes transcrites literalment dels exàmens oficials publicats per
 * l'Ajuntament de Roses.
 *
 * ─── Estat actual: BUIT, i no per descuit ────────────────────────────────
 *
 * L'entorn en què es va construir aquesta versió té una política d'eixida de
 * xarxa que va denegar (CONNECT 403) l'accés a `www.roses.cat`, que és on es
 * publiquen els quadernets i les respostes oficials del tribunal.
 *
 * Transcriure aquestes preguntes de memòria seria inventar-les. El contingut
 * d'un examen oficial només es pot importar del document oficial, i per això
 * aquest fitxer queda buit fins que `npm run exams:import` s'executi des d'una
 * xarxa amb accés.
 *
 * Els quatre exàmens de prioritat P0 estan registrats a `../exams.ts` amb
 * `importStatus: 'pending-source'`, la seva URL real i el nombre de preguntes
 * esperat, i l'informe de cobertura (`npm run content:report`) els reporta
 * com a pendents.
 */
import type { Question } from '../../../schemas/index.ts'

export const OFFICIAL_EXAM_QUESTIONS: Question[] = []
