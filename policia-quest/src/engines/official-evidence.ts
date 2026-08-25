/**
 * Dues veritats sobre una pregunta d'examen oficial, i què fer amb cada una.
 *
 * La plantilla que va publicar el tribunal és un fet històric: no es toca mai,
 * i és la que puntua quan algú reprodueix aquell examen. El dret vigent avui és
 * una altra cosa, i pot no coincidir-hi —perquè la norma ha canviat des de
 * l'examen, o perquè la plantilla ja no quadrava amb la norma el dia que es va
 * publicar—.
 *
 * Barrejar-les fa mal de dues maneres oposades. Si l'app només ensenya la
 * plantilla, ensenya dret derogat. Si «corregeix» la plantilla, falsifica un
 * document oficial. Aquest motor separa les dues coses i decideix, per a una
 * data controlada, què es pot fer amb cada pregunta:
 *
 *  - si es pot servir com a material vigent,
 *  - si compta per al domini,
 *  - si pot generar repàs,
 *  - quin avís necessita la correcció,
 *  - quina resposta puntua i quina sosté la norma.
 *
 * **Tothom ha de passar per aquí.** La selecció de sessions, el constructor de
 * simulacres, el domini, la cua de repàs, la interfície, els informes i el
 * validador consumeixen la mateixa decisió. Si una pantalla se la calculés pel
 * seu compte, tard o d'hora en diria una altra.
 *
 * És un motor pur: el dia entra com a paràmetre i no crida `Date.now()`.
 */
import type { OfficialEvidenceStatus, Question } from '../domain/types.ts'

/** Avís que la correcció ha de mostrar, si n'ha de mostrar cap. */
export type OfficialNotice =
  | 'none'
  /** Correcta el dia de l'examen; la norma ha canviat des de llavors. */
  | 'superseded'
  /** La plantilla no quadra amb la norma que ja regia el dia de l'examen. */
  | 'key-conflict'
  /** Actualitat d'aquell dia: no afirma res sobre el món d'avui. */
  | 'historical'
  /** Sense evidència: només consta la procedència. */
  | 'pending'

export interface OfficialVerdict {
  /** Es pot servir en entrenament i simulacres vigents. */
  usableForCurrentLearning: boolean
  /** Compta per al domini per tema i per al semàfor de progrés. */
  countsForMastery: boolean
  /** Pot entrar a la cua de repàs quan es falla. */
  canGenerateReview: boolean
  /** Què ha de dir la correcció. */
  notice: OfficialNotice
  /** Lletra que puntua en reproduir l'examen: sempre la del tribunal. */
  scoringAnswer: string
  /**
   * Lletra que sosté la norma verificada quan difereix de la plantilla.
   * `'cap'` quan la reforma va deixar la resposta fora de les quatre opcions;
   * `null` quan no hi ha discrepància o no s'ha pogut demostrar.
   */
  currentLawAnswer: string | null
}

/**
 * Estats que **no** poden entrar a l'aprenentatge vigent.
 *
 * Cada un per un motiu diferent, i tots per la mateixa raó de fons: servir-los
 * com a material actual afirmaria alguna cosa que no és certa avui.
 */
const UNSAFE_FOR_TODAY: ReadonlySet<OfficialEvidenceStatus> = new Set([
  'supported-at-exam-now-superseded',
  'official-key-conflicts-with-law-at-exam',
  'pending-evidence',
  'historical-current-affairs',
])

const NOTICE_BY_STATUS: Readonly<Record<OfficialEvidenceStatus, OfficialNotice>> = {
  'supported-current': 'none',
  'partially-supported': 'none',
  'supported-at-exam-now-superseded': 'superseded',
  'official-key-conflicts-with-law-at-exam': 'key-conflict',
  'pending-evidence': 'pending',
  'historical-current-affairs': 'historical',
  'general-knowledge': 'none',
  'out-of-syllabus': 'none',
}

/**
 * Què es pot fer amb aquesta pregunta el dia `todayIso`.
 *
 * Una pregunta que no és d'examen oficial no passa per aquí: el seu veredicte
 * és el normal, i es retorna igualment perquè qui crida no hagi de fer dos
 * camins.
 */
export function officialVerdict(question: Question, todayIso: string): OfficialVerdict {
  const meta = question.officialExam
  if (!meta) {
    return {
      usableForCurrentLearning: true,
      countsForMastery: true,
      canGenerateReview: true,
      notice: 'none',
      scoringAnswer: question.correct,
      currentLawAnswer: null,
    }
  }

  const evidence = meta.evidence
  // Una pregunta oficial sense judici probatori no es pot donar per segura: la
  // matriu ha de tenir-les totes, i si en falta una val més que quedi fora de
  // l'aprenentatge vigent que no pas que s'hi coli sense revisar.
  const status: OfficialEvidenceStatus = evidence?.status ?? 'pending-evidence'
  const safe = !UNSAFE_FOR_TODAY.has(status)

  return {
    usableForCurrentLearning: safe,
    countsForMastery: safe,
    canGenerateReview: safe,
    notice: NOTICE_BY_STATUS[status],
    // La plantilla oficial puntua sempre, també quan contradiu la norma: és el
    // que va passar aquell dia i reproduir l'examen vol dir reproduir això.
    scoringAnswer: meta.officialAnswer === 'anullada' ? question.correct : meta.officialAnswer,
    currentLawAnswer: evidence?.currentLawAnswer ?? null,
  }
}

/**
 * Si una resposta dona lloc a repàs.
 *
 * Fallar ensenya, i per això un error normal entra a la cua. Però en una
 * pregunta on la plantilla i la norma no coincideixen, «error» no vol dir res:
 * qui tria l'opció que sosté la norma no s'ha equivocat de dret, s'ha
 * desviat d'un document històric. Fer-l'hi repassar seria ensenyar-li a
 * respondre malament.
 */
export function shouldQueueReview(
  question: Question,
  chosen: string,
  todayIso: string,
): boolean {
  const verdict = officialVerdict(question, todayIso)
  if (!verdict.canGenerateReview) return false
  if (chosen === verdict.scoringAnswer) return false
  return true
}

/** Preguntes que es poden servir com a material vigent, filtrades d'un banc. */
export function currentLearningPool(questions: readonly Question[], todayIso: string): Question[] {
  return questions.filter((q) => officialVerdict(q, todayIso).usableForCurrentLearning)
}
