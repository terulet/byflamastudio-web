/**
 * La porta de l'actualitat, com a funció pura.
 *
 * L'actualitat és l'únic contingut d'aquesta app que **afirma com és el món ara
 * mateix**: qui ocupa un càrrec, quant costa una cosa, què va passar el mes
 * passat. Si s'equivoca no ensenya una norma antiga, ensenya un fet fals.
 *
 * Per això passa per una porta més estreta que la resta del contingut. Aquesta
 * funció és aquesta porta, i la fan servir tant `scripts/validate-content.ts`
 * —que trenca el build— com els tests, de manera que la regla és una de sola i
 * es pot provar.
 */
import type { Question, Source } from '../domain/types.ts'

export interface ActualitatContext {
  /** Identificadors de preguntes que consten dins d'algun paquet versionat. */
  packedQuestionIds: ReadonlySet<string>
  /** Fonts del manifest, per comprovar-ne la data de publicació. */
  sources: readonly Source[]
}

/**
 * Motius pels quals una pregunta d'actualitat no pot entrar al banc.
 *
 * Retorna una llista buida si la pregunta compleix. Les preguntes que no estan
 * etiquetades `actualitat` no passen per aquí: retornen sempre buit.
 */
export function currentAffairsIssues(
  question: Question,
  context: ActualitatContext,
): string[] {
  if (!question.tags.includes('actualitat')) return []

  const issues: string[] = []

  // 1. Caduca sempre, i amb data. Sense caducitat, un fet cert avui es queda
  //    al banc afirmant-se per sempre.
  if (!question.dynamic) issues.push('ha de portar dynamic: true')
  if (!question.reviewBy) issues.push('ha de portar reviewBy')

  // 2. Viu dins d'un paquet versionat, mai solta pel banc. El paquet és el que
  //    dona període cobert i caducitat conjunta.
  if (question.status === 'active' && !context.packedQuestionIds.has(question.questionId)) {
    issues.push('activa però fora de cap paquet d’actualitat')
  }

  // 3. Cita una font contrastada per una persona, amb data de publicació. Una
  //    pregunta d'actualitat amb la referència pendent afirmaria un fet que
  //    ningú ha comprovat.
  if (question.references.length === 0) {
    issues.push('sense cap referència')
  }
  for (const reference of question.references) {
    if (reference.reviewStatus !== 'verified') {
      issues.push(
        `la referència a ${reference.sourceId} és ${reference.reviewStatus}: ` +
          'l’actualitat només entra amb la font contrastada',
      )
    }
    const source = context.sources.find((s) => s.sourceId === reference.sourceId)
    if (source && !source.publishedAt) {
      issues.push(`la font ${source.sourceId} no té data de publicació`)
    }
  }

  // 4. No pot venir d'un examen antic: allò és material històric, cert el dia
  //    de la prova i no necessàriament avui.
  if (question.origin === 'official') {
    issues.push('una pregunta d’examen oficial és material històric, no actualitat vigent')
  }

  return issues
}

/** Problemes de coherència interna d'un paquet d'actualitat. */
export function packIssues(
  pack: { packId: string; coversFrom: string; coversTo: string; expiresAt: string; questionIds: readonly string[] },
  questions: readonly Question[],
): string[] {
  const issues: string[] = []
  if (pack.coversTo < pack.coversFrom) {
    issues.push('el període cobert acaba abans de començar')
  }
  if (pack.expiresAt <= pack.coversTo) {
    issues.push('caduca abans d’acabar el període que cobreix')
  }
  for (const id of pack.questionIds) {
    const question = questions.find((q) => q.questionId === id)
    if (!question) {
      issues.push(`la pregunta ${id} no existeix`)
      continue
    }
    if (!question.tags.includes('actualitat')) {
      issues.push(`${id} no està etiquetada com a actualitat`)
    }
    if (question.reviewBy && question.reviewBy > pack.expiresAt) {
      issues.push(
        `${id} diu que és vigent (${question.reviewBy}) més enllà de la caducitat ` +
          `del paquet (${pack.expiresAt})`,
      )
    }
  }
  return issues
}
