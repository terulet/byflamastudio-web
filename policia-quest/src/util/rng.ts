/**
 * Generador pseudoaleatori determinista (mulberry32).
 *
 * La selecció de sessions i simulacres ha de ser reproduïble: amb la mateixa
 * llavor i el mateix banc de preguntes, el resultat és sempre idèntic. Això fa
 * que els tests siguin fiables i que una sessió interrompuda es pugui refer.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Barreja de Fisher–Yates amb PRNG injectat. No muta l'entrada. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const a = out[i]!
    const b = out[j]!
    out[i] = b
    out[j] = a
  }
  return out
}

/** Llavor estable a partir d'una cadena (FNV-1a de 32 bits). */
export function seedFromString(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
