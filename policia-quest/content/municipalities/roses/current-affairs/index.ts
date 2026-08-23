/**
 * Paquets d'actualitat versionats.
 *
 * La prova de cultura general de Roses reserva la meitat de les preguntes a
 * l'actualitat social, cultural i política. L'actualitat **caduca**: un càrrec
 * polític, una xifra o un premi deixen de ser certs. Per això no es barreja mai
 * amb el contingut permanent i es distribueix en paquets amb data de creació,
 * període cobert i data de caducitat.
 *
 * ─── Estat actual ────────────────────────────────────────────────────────
 *
 * Aquesta primera versió entrega la **infraestructura** però cap pregunta
 * d'actualitat activa. L'entorn de construcció no tenia accés a cap font
 * periodística ni institucional (només registres de paquets i github.com), de
 * manera que no es va poder verificar cap fet recent.
 *
 * Omplir aquest paquet amb notícies redactades de memòria hauria estat
 * inventar contingut, exactament el que la política de contingut prohibeix.
 * El dèficit queda visible a `npm run content:report`.
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
      'construcció (2026-08-23), i no s’inventen fets. Per omplir-lo: verificar cada fet contra ' +
      'una font oficial o periodística fiable, marcar les preguntes amb dynamic: true i fixar-hi ' +
      'reviewBy, i afegir-ne els identificadors a questionIds.',
  },
]
