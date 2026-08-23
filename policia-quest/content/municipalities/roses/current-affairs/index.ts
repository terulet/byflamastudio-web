/**
 * Paquets d'actualitat versionats.
 *
 * La prova de cultura general de Roses reserva 10 de les 20 preguntes a
 * l'actualitat social, cultural i política. L'actualitat **caduca**: un càrrec,
 * una xifra o un premi deixen de ser certs. Per això no es barreja mai amb el
 * contingut permanent i es distribueix en paquets amb data de creació, període
 * cobert i data de caducitat.
 *
 * ─── Estat actual: un paquet amb 25 preguntes ────────────────────────────
 *
 * El 24 d'agost de 2026 es va rebre un paquet de candidats acompanyat de 19
 * **instantànies textuals** de les pàgines oficials, cadascuna segellada amb el
 * seu SHA-256. Això va resoldre el problema que havia mantingut el paquet buit:
 * l'entorn de construcció no arriba a cap font (CONNECT 403 a roses.cat,
 * lamoncloa.gob.es, gencat.cat i la resta), però una instantània verificable no
 * necessita xarxa per llegir-se.
 *
 * Les 25 preguntes es van adoptar una a una contra el text preservat, i onze
 * porten l'enunciat o l'explicació **retallats** respecte del candidat original,
 * perquè afirmaven coses que la instantània no demostra. El detall de cada
 * decisió és a `artifacts/actualitat-decisio-2026-08-24.md`.
 *
 * El que una instantània **no** pot demostrar és que sigui fidel a la pàgina
 * viva: això depèn de qui la va prendre. Per això el manifest en desa el mètode
 * de captura i la data, i el dia que hi hagi xarxa es pot tornar a comprovar.
 *
 * ─── Com s'omple el pròxim ───────────────────────────────────────────────
 *
 * 1. Registrar cada font al manifest amb `publishedAt` (la data de publicació
 *    del fet, no la de consulta) i adoptar-ne la còpia:
 *
 *        npm run sources:adopt -- --list
 *        # deixar el document a sources/inbox/<sourceId>.pdf
 *        npm run sources:adopt
 *
 *    O bé, si les fonts no són abastables, preparar un paquet de candidats amb
 *    instantànies i passar-hi l'importador:
 *
 *        python3 scripts/transcription/import_current_affairs.py --offline --check
 *        python3 scripts/transcription/import_current_affairs.py --offline
 *
 * 2. Escriure la pregunta amb `refv()`, que marca la referència com a
 *    `verified`. Només s'hi posa `verified` si algú ha obert la font i ha vist
 *    el fet, amb pàgina o apartat concret.
 *
 * 3. Afegir-ne l'identificador a `questionIds` del paquet. Si el genera
 *    l'importador, això ja ho fa ell: vegeu `pack-2026-08.ts`.
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
 * El camí de bloqueig i desbloqueig està provat amb fixtures i amb el banc real
 * a `tests/unit/actualitat.test.ts`: avui hi ha 25 preguntes vigents i el
 * simulacre surt 10+10; el 2027-02-28 en quedaran nou i es tornarà a bloquejar
 * sol. No cal tocar cap motor.
 */
import type { CurrentAffairsPack } from '../../../schemas/index.ts'
import { PACK_2026_08 } from './pack-2026-08.ts'

export const ROSES_CURRENT_AFFAIRS: CurrentAffairsPack[] = [PACK_2026_08]
