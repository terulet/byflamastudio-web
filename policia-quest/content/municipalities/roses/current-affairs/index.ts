/**
 * Paquets d'actualitat versionats.
 *
 * La prova de cultura general de Roses reserva 10 de les 20 preguntes a
 * l'actualitat social, cultural i política. L'actualitat **caduca**: un càrrec,
 * una xifra o un premi deixen de ser certs. Per això no es barreja mai amb el
 * contingut permanent i es distribueix en paquets amb data de creació, període
 * cobert i data de caducitat.
 *
 * ─── Estat actual: BUIT, i no per descuit ────────────────────────────────
 *
 * Aquesta versió entrega la **infraestructura sencera i provada** però cap
 * pregunta. L'entorn de construcció no té accés a cap font: `roses.cat`,
 * `boe.es`, `ddgi.cat` i `portaljuridic.gencat.cat` responen CONNECT 403. Sense
 * poder obrir una font vigent no es pot afirmar cap fet actual, i escriure'n de
 * memòria seria inventar-los. El coneixement del model, a més, és anterior a la
 * data d'avui: fins i tot allò que "recorda" podria haver canviat.
 *
 * El dèficit és visible a `npm run content:report` i manté bloquejats el
 * simulacre de cultura general i el complet.
 *
 * ─── Com s'omple ─────────────────────────────────────────────────────────
 *
 * 1. Registrar cada font al manifest amb `publishedAt` (la data de publicació
 *    del fet, no la de consulta) i adoptar-ne la còpia:
 *
 *        npm run sources:adopt -- --list
 *        # deixar el document a sources/inbox/<sourceId>.pdf
 *        npm run sources:adopt
 *
 * 2. Escriure la pregunta amb `refv()`, que marca la referència com a
 *    `verified`. Només s'hi posa `verified` si algú ha obert la font i ha vist
 *    el fet, amb pàgina o apartat concret.
 *
 * 3. Afegir-ne l'identificador a `questionIds` del paquet.
 *
 * Plantilla:
 *
 *     ...questionsFor(31, [
 *       {
 *         n: 900,
 *         track: 'cultura-general',
 *         tags: ['actualitat'],
 *         dynamic: true,
 *         reviewBy: '2026-11-30',        // mai més enllà de l'expiresAt del paquet
 *         stem: '…',
 *         options: ['…', '…', '…', '…'],
 *         correct: 'b',
 *         whyWrong: { a: '…', c: '…', d: '…' },
 *         explainCa: '…',
 *         explainEs: '…',
 *         refs: [refv('id-de-la-font', 'apartat o pàgina', '2026-08-01')],
 *       },
 *     ])
 *
 * ─── Què refusa el validador ─────────────────────────────────────────────
 *
 * `scripts/validate-content.ts` trenca el build si una pregunta etiquetada
 * `actualitat`:
 *
 *   - no porta `dynamic: true` amb `reviewBy`;
 *   - està activa i fora de cap paquet;
 *   - té cap referència que no sigui `verified`;
 *   - cita una font sense data de publicació;
 *   - ve d'un examen oficial antic (allò és material històric).
 *
 * I si un paquet caduca abans d'acabar el període que cobreix, o conté una
 * pregunta que es declara vigent més enllà de la seva caducitat.
 *
 * El camí de desbloqueig està provat amb fixtures a
 * `tests/unit/actualitat.test.ts`: amb deu preguntes d'actualitat vigents i deu
 * de cultura general, el simulacre s'obre sol i el quadernet surt 10+10. El dia
 * que caduquen, es torna a bloquejar sol. No cal tocar cap motor.
 */
import type { CurrentAffairsPack } from '../../../schemas/index.ts'

export const ROSES_CURRENT_AFFAIRS: CurrentAffairsPack[] = [
  {
    packId: 'roses-actualitat-2026-08',
    createdAt: '2026-08-23',
    coversFrom: '2026-01-01',
    coversTo: '2026-08-23',
    expiresAt: '2026-11-30',
    scope: ['roses', 'alt-emporda', 'girona', 'catalunya', 'espanya'],
    status: 'active',
    questionIds: [],
    note:
      'Paquet creat buit a propòsit. Cap font d’actualitat era accessible des de l’entorn de ' +
      'construcció (CONNECT 403 a roses.cat, boe.es, ddgi.cat i portaljuridic.gencat.cat el ' +
      '2026-08-23) i no s’inventen fets. La infraestructura és completa i provada: vegeu la ' +
      'capçalera d’aquest fitxer per al procediment i tests/unit/actualitat.test.ts per al camí ' +
      'de desbloqueig.',
  },
]
