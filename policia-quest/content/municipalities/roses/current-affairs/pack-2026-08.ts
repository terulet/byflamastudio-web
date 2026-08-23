/**
 * Paquet d'actualitat 2026-08. **Generat** per
 * `scripts/transcription/import_current_affairs.py --offline`.
 *
 * Conté les 25 preguntes que les instantànies segellades del paquet de
 * candidats van demostrar, una a una. Cap s'ha escrit de memòria i cap afirma
 * res que el text preservat de la seva font no digui.
 *
 * La caducitat del paquet és el `reviewBy` més llarg que conté, i cada pregunta
 * porta el seu:
 *
 *   - 2026-12-31: en caduquen 6; en queden 19.
 *   - 2027-01-31: en caduquen 3; en queden 16.
 *   - 2027-02-28: en caduquen 7; en queden 9.
 *   - 2027-03-31: en caduquen 7; en queden 2.
 *   - 2027-05-16: en caduquen 1; en queden 1.
 *   - 2027-06-08: en caduquen 1; en queden 0.
 *
 * Quan una data passa, `isCurrent()` deixa la pregunta fora de la quota sense
 * que ningú hi toqui. El 2027-02-28 en queden nou, i aquell dia el simulacre de
 * cultura general es torna a bloquejar sol: és el comportament previst.
 */
import type { CurrentAffairsPack } from '../../../schemas/index.ts'

export const PACK_2026_08: CurrentAffairsPack = {
  packId: 'roses-actualitat-2026-08',
  createdAt: '2026-08-24',
  coversFrom: '2024-10-29',
  coversTo: '2026-08-21',
  expiresAt: '2027-06-08',
  scope: ['roses', 'catalunya', 'espanya', 'internacional'],
  status: 'active',
  questionIds: [
    'actualitat-2026-roses-001',
    'actualitat-2026-roses-002',
    'actualitat-2026-roses-003',
    'actualitat-2026-roses-004',
    'actualitat-2026-roses-005',
    'actualitat-2026-roses-006',
    'actualitat-2026-roses-007',
    'actualitat-2026-roses-008',
    'actualitat-2026-cat-009',
    'actualitat-2026-cat-010',
    'actualitat-2026-cat-011',
    'actualitat-2026-cat-012',
    'actualitat-2026-cat-013',
    'actualitat-2026-cat-014',
    'actualitat-2026-es-015',
    'actualitat-2026-es-016',
    'actualitat-2026-es-017',
    'actualitat-2026-es-018',
    'actualitat-2026-es-019',
    'actualitat-2026-eu-020',
    'actualitat-2026-eu-021',
    'actualitat-2026-cultura-022',
    'actualitat-2026-cultura-023',
    'actualitat-2026-cultura-024',
    'actualitat-2026-esport-025',
  ],
  note:
    'Adoptat el 2026-08-24 des d’instantànies textuals segellades amb SHA-256, no des de ' +
    'la xarxa: cap de les 19 fonts era abastable des de l’entorn de construcció. ' +
    'Cada instantània es conserva a sources/cache/ amb el seu hash i el mètode de captura. ' +
    'El detall pregunta per pregunta és a artifacts/actualitat-decisio-2026-08-24.md.',
}
