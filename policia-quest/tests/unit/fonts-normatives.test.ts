/**
 * Les 43 normes generals: que «verificada» vulgui dir el que diu.
 *
 * El 2026-08-24 es va adoptar el tercer paquet de documents portats a mà: les
 * 43 normes generals que el banc citava sense tenir-ne còpia. Aquest test
 * impedeix la manera fàcil d'equivocar-se amb un paquet així: donar per bona
 * una referència perquè el document ha arribat, no perquè algú hi hagi trobat
 * la proposició.
 *
 * Per això lliga tres coses que es poden separar sense voler:
 *
 *  1. El **veredicte** de cada afirmació viu a `adopcio-normativa-2026-08-24.json`
 *     amb el fragment que el sosté. Si algú posa una referència a `verified`
 *     sense veredicte que ho aguanti, aquí es veu.
 *  2. Dues de les 43 descàrregues **no contenen el document**: són l'esquelet
 *     de navegació d'una pàgina que es carrega per JavaScript. Cap referència
 *     que en depengui pot constar com a verificada, per molt que el fitxer
 *     existeixi i el hash quadri.
 *  3. El manifest ha de declarar el mateix fitxer i el mateix SHA-256 que
 *     l'adopció, i —si la còpia hi és— el fitxer ha de tenir aquest hash.
 *     `sources/cache/` no es versiona, així que la comprovació de bytes només
 *     s'exigeix quan la còpia és al disc.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ROSES_PACK } from '../../content/municipalities/roses/index.ts'
import adoption from '../../content/municipalities/roses/adopcio-normativa-2026-08-24.json' with { type: 'json' }
import evidenceMap from '../../content/municipalities/roses/questions/official-evidence-map.json' with { type: 'json' }

const CACHE = fileURLToPath(new URL('../../sources/cache/', import.meta.url))

/** Veredictes que autoritzen `verified`. La resta deixa la referència pendent. */
const PROVEN = new Set(['demostrat', 'demostrat-localitzador-corregit', 'demostrat-parcial'])

const PACK_SOURCE_IDS = new Set(adoption.sources.map((s) => s.sourceId))

/** Totes les referències del banc i de les lliçons, amb qui les fa servir. */
const REFERENCES = [
  ...ROSES_PACK.questions.flatMap((q) =>
    q.references.map((r) => ({ consumer: q.questionId, kind: 'pregunta' as const, ref: r })),
  ),
  ...ROSES_PACK.lessons.flatMap((l) =>
    l.references.map((r) => ({ consumer: l.lessonId, kind: 'llico' as const, ref: r })),
  ),
]

describe('el paquet de 43 normes generals', () => {
  it('cobreix les 43 fonts i el manifest les té totes amb còpia local', () => {
    expect(adoption.sources).toHaveLength(43)
    for (const row of adoption.sources) {
      const source = ROSES_PACK.sources.find((s) => s.sourceId === row.sourceId)
      expect(source, row.sourceId).toBeDefined()
      expect(source!.fetchStatus, row.sourceId).toBe('downloaded')
      expect(source!.cacheFile, row.sourceId).toBe(row.cacheFile)
      expect(source!.sha256, row.sourceId).toBe(row.sha256)
    }
  })

  it('i el manifest no deixa cap font pendent de descàrrega', () => {
    const pending = ROSES_PACK.sources.filter((s) => s.fetchStatus === 'pending-download')
    expect(pending.map((s) => s.sourceId)).toEqual([])
  })

  it('la còpia del disc, quan hi és, té el hash que el manifest declara', () => {
    // sources/cache/ no es versiona: en un clon net no hi ha res a comprovar i
    // el test no ha de fallar per això. Quan hi és, ha de quadrar byte a byte.
    let checked = 0
    for (const row of adoption.sources) {
      const path = `${CACHE}${row.cacheFile}`
      if (!existsSync(path)) continue
      const bytes = readFileSync(path)
      expect(createHash('sha256').update(bytes).digest('hex'), row.cacheFile).toBe(row.sha256)
      expect(bytes.length, row.cacheFile).toBe(row.bytes)
      checked++
    }
    expect(checked === 0 || checked === 43, `${checked} còpies comprovades`).toBe(true)
  })
})

describe('cada referència diu la veritat sobre si està verificada', () => {
  // La clau porta el localitzador: tres microlliçons citen la mateixa font dues
  // vegades, amb dos localitzadors diferents, i cada cita es revisa per separat.
  const key = (consumer: string, sourceId: string, locator: string) => `${consumer}::${sourceId}::${locator}`

  /*
   * Hi ha dos registres de veredictes i tots dos valen, perquè tots dos diuen
   * qui va obrir el document i què hi va trobar.
   *
   * El primer és l'adopció del 2026-08-24, que va revisar les referències que
   * el banc ja tenia. El segon és la matriu probatòria de les 189 preguntes
   * oficials: cada citació hi porta el fragment literal de la còpia local que
   * sosté l'explicació, i és d'aquestes citacions que surten les referències
   * normatives de les preguntes d'examen. Un registre no pot cobrir l'altre —
   * són revisions de dies diferents sobre afirmacions diferents— però la regla
   * que imposen és la mateixa: cap referència diu `verified` sense que algú
   * hagi escrit què hi va llegir.
   */
  interface Decision {
    citations?: Array<{ sourceId: string; locator: string; quote: string }>
    explain?: { ca: string; es: string }
  }
  const decisions = evidenceMap.decisions as unknown as Record<string, Decision>
  const evidenceClaims = Object.entries(decisions).flatMap(([questionId, decision]) =>
    (decision.explain ? (decision.citations ?? []) : []).map((c) => ({
      consumer: questionId,
      sourceId: c.sourceId,
      locator: c.locator,
      verdict: 'demostrat',
      evidence: c.quote,
    })),
  )
  const allClaims = [...adoption.claims, ...evidenceClaims]
  const byKey = new Map(allClaims.map((c) => [key(c.consumer, c.sourceId, c.locator), c]))

  it('tota referència a una de les 43 fonts té veredicte a l’adopció', () => {
    const orphans = REFERENCES.filter(
      (r) => PACK_SOURCE_IDS.has(r.ref.sourceId) && !byKey.has(key(r.consumer, r.ref.sourceId, r.ref.locator)),
    )
    expect(orphans.map((r) => `${r.consumer}::${r.ref.sourceId}`)).toEqual([])
  })

  it('i el seu reviewStatus és exactament el que el veredicte permet', () => {
    const wrong: string[] = []
    for (const { consumer, ref } of REFERENCES) {
      const claim = byKey.get(key(consumer, ref.sourceId, ref.locator))
      if (!claim) continue
      const expected = PROVEN.has(claim.verdict) ? 'verified' : 'pending-source-verification'
      if (ref.reviewStatus !== expected) {
        wrong.push(`${consumer}::${ref.sourceId} és ${ref.reviewStatus} i el veredicte «${claim.verdict}» demana ${expected}`)
      }
    }
    expect(wrong).toEqual([])
  })

  it('cap veredicte es dona per bo sense el fragment que el sosté', () => {
    for (const claim of allClaims) {
      // Un localitzador («art. 95») ja és evidència útil si algú l'ha obert i
      // hi ha trobat la proposició; el que no pot passar és que no hi hagi res.
      expect(claim.evidence, `${claim.consumer}::${claim.sourceId}`).toBeTruthy()
      expect(claim.evidence.length, `${claim.consumer}::${claim.sourceId}`).toBeGreaterThan(9)
    }
  })

})

describe('una descàrrega buida no verifica res', () => {
  const broken = adoption.sources.filter((s) => !s.textExtracted).map((s) => s.sourceId)

  it('hi ha exactament dues còpies sense text, i estan declarades', () => {
    expect(broken.sort()).toEqual(['agencia-ciberseguretat-catalunya', 'roses-web-municipi'])
    for (const sourceId of broken) {
      const row = adoption.sources.find((s) => s.sourceId === sourceId)!
      expect(row.note, sourceId).toBeTruthy()
      // El manifest també ho ha de dir, perquè és on mira qui torni a baixar-les.
      const source = ROSES_PACK.sources.find((s) => s.sourceId === sourceId)!
      expect(source.fetchNote, sourceId).toBeTruthy()
    }
  })

  it('i cap referència que en depengui consta com a verificada', () => {
    const claimed = REFERENCES.filter(
      (r) => broken.includes(r.ref.sourceId) && r.ref.reviewStatus === 'verified',
    )
    expect(claimed.map((r) => `${r.consumer}::${r.ref.sourceId}`)).toEqual([])
  })
})

describe('el que encara no es pot afirmar es diu, no es tapa', () => {
  it('les referències pendents de les 43 fonts són només les que l’adopció explica', () => {
    // Aquest fitxer revisa el paquet de les 43 normes generals; una
    // pregunta d'examen que cita el seu propi quadernet (sense marca de
    // resposta llegible) ja s'explica sola amb `status: 'draft'` —el
    // validador de contingut li impedeix ser `active` sense font— i no és
    // el que aquest test verifica.
    const pending = REFERENCES.filter(
      (r) => r.ref.reviewStatus === 'pending-source-verification' && PACK_SOURCE_IDS.has(r.ref.sourceId),
    )
    // Cada pendent ha de tenir motiu: o la còpia no porta text, o la font no
    // sosté l'afirmació. Cap pendent pot ser un descuit.
    const unexplained = pending.filter((r) => {
      const claim = byKey(r)
      return claim === undefined
    })
    expect(unexplained.map((r) => `${r.consumer}::${r.ref.sourceId}`)).toEqual([])
  })

  function byKey(r: (typeof REFERENCES)[number]) {
    return adoption.claims.find((c) => c.consumer === r.consumer && c.sourceId === r.ref.sourceId)
  }


  it('i les fonts que falten estan enumerades amb el motiu', () => {
    expect(adoption.missingSources.length).toBeGreaterThan(0)
    for (const row of adoption.missingSources) {
      expect(row.need.length, row.forClaim).toBeGreaterThan(10)
      expect(row.why.length, row.forClaim).toBeGreaterThan(20)
    }
  })
})
