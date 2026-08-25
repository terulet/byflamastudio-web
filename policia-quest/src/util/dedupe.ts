/**
 * Normalització i hash d'enunciats per detectar duplicats.
 *
 * Dues preguntes són duplicades si, un cop tret l'accentuació, la puntuació,
 * les majúscules i els espais sobrants, l'enunciat coincideix exactament. Això
 * atrapa les còpies literals i les variacions cosmètiques; per a les variacions
 * més subtils, `scripts/validate-content.ts` hi afegeix una comprovació de
 * similitud entre enunciats del mateix tema.
 *
 * El hash és FNV-1a en quatre carrils de 32 bits, no SHA-256, perquè aquest
 * mòdul l'han de poder fer servir tant els scripts de Node com el navegador
 * i `node:crypto` no hi és disponible. No és criptogràfic i no cal que ho
 * sigui: només serveix per agrupar enunciats idèntics.
 */

const FNV_OFFSET = 0x811c9dc5
const FNV_PRIME = 0x01000193

export function normalizeStem(stem: string): string {
  return stem
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // treu els diacrítics
    .toLowerCase()
    .replace(/[‘’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function dedupeHash(stem: string): string {
  const text = normalizeStem(stem)
  // Quatre carrils amb llavors diferents: 128 bits de sortida en hexadecimal.
  const seeds = [FNV_OFFSET, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
  const lanes = seeds.slice()

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    for (let lane = 0; lane < lanes.length; lane++) {
      lanes[lane] = Math.imul((lanes[lane]! ^ code) >>> 0, FNV_PRIME + lane * 2) >>> 0
    }
  }

  return lanes.map((lane) => (lane >>> 0).toString(16).padStart(8, '0')).join('')
}
