/**
 * Paquet complet de Roses, lliçons incloses.
 *
 * El fan servir els scripts de la Content Factory i els tests de contingut,
 * que necessiten veure-ho tot alhora. L'aplicació, en canvi, importa
 * `pack-core.ts` i carrega les lliçons sota demanda.
 */
import type { MunicipalityPack } from '../../schemas/index.ts'
import { ROSES_PACK_CORE } from './pack-core.ts'
import { ROSES_LESSONS } from './lessons/index.ts'

export const ROSES_PACK: MunicipalityPack = {
  ...ROSES_PACK_CORE,
  lessons: ROSES_LESSONS,
}

export * from './pack-core.ts'
export { ROSES_LESSONS }
