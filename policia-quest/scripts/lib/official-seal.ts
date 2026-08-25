/**
 * El segell dels textos oficials: una sola definició, dos consumidors.
 *
 * `npm run content:matrix` i `tests/unit/matriu-oficials.test.ts` vigilen la
 * mateixa cosa —que ningú reescrigui un document del tribunal— i si cadascun
 * es calculés l'empremta pel seu compte, el dia que una divergís ningú sabria
 * quina de les dues té raó. Per això viu aquí.
 *
 * L'empremta cobreix identificador, número original, clau del tribunal,
 * enunciat i les quatre opcions **en ordre**. No cobreix ni el tema, ni
 * l'explicació, ni les referències: aquestes són decisions editorials i han de
 * poder millorar sense trencar res.
 *
 * Si canvia, o algú ha «corregit» un document oficial o la transcripció s'ha
 * espatllat. Les dues coses es miren a mà contra el PDF; el valor només es
 * torna a segellar (`npm run content:matrix -- --seal`) quan s'ha comprovat
 * què s'ha mogut i per què.
 */
import { createHash } from 'node:crypto'
import type { Question } from '../../src/domain/types.ts'

export const SEALED = '9f762a38733dd48a34fdb714b1d3f75b1492138cf12414c6dd9304e96d1b3576'

export function officialFingerprint(questions: readonly Question[]): string {
  const rows = [...questions]
    .sort((a, b) => a.questionId.localeCompare(b.questionId))
    .map((q) => [
      q.questionId,
      q.officialExam!.originalNumber,
      q.officialExam!.officialAnswer,
      q.stem,
      ...q.options.map((o) => o.text),
    ])
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}
