/**
 * La matriu de les 189: que continuï dient el que diu.
 *
 * Aquest fitxer defensa tres coses que es trenquen soles amb el temps i que,
 * un cop trencades, no fan soroll:
 *
 *  1. **El document oficial no es toca.** Enunciats, opcions i claus del
 *     tribunal es congelen amb una empremta. Si algú «corregeix» una pregunta
 *     perquè la troba mal formulada —o perquè la norma ha canviat—, aquí
 *     salta. Corregir la plantilla no és arreglar-la: és falsificar-la.
 *  2. **Dir «demostrat» costa una cita.** Cap estat que afirmi res pot
 *     existir sense el fragment de la còpia local que el sosté, i cap pendent
 *     pot existir sense dir què li falta.
 *  3. **El veredicte mana a tot arreu.** Selecció, domini, repàs i simulacre
 *     consumeixen `officialVerdict`. Una pregunta on la plantilla i la norma
 *     no coincideixen no pot entrar per cap porta lateral, ni per un filtre de
 *     tema ni pel constructor de quadernets.
 *
 * El rellotge entra sempre com a paràmetre: cap prova d'aquest fitxer depèn
 * del dia que s'executi.
 */
import { describe, expect, it } from 'vitest'
import { ROSES_PACK } from '../../content/municipalities/roses/index.ts'
import evidenceMap from '../../content/municipalities/roses/questions/official-evidence-map.json' with { type: 'json' }
import adoption from '../../content/municipalities/roses/adopcio-normativa-2026-08-24.json' with { type: 'json' }
import {
  currentLearningPool,
  officialVerdict,
  shouldQueueReview,
} from '../../src/engines/official-evidence.ts'
import { buildExamPaper, selectSession } from '../../src/engines/selection.ts'
import { SEALED, officialFingerprint } from '../../scripts/lib/official-seal.ts'
import type { OfficialEvidenceStatus, Question } from '../../src/domain/types.ts'

interface Citation {
  sourceId: string
  locator: string
  quote: string
}
interface Decision {
  status: OfficialEvidenceStatus
  why: string
  citations?: Citation[]
  lawAtExam?: string
  lawToday?: string
  changedOn?: string
  currentLawAnswer?: string
  missing?: string
  explain?: { ca: string; es: string }
}

const ALL_DECISIONS = evidenceMap.decisions as unknown as Record<string, Decision>

/*
 * Aquesta matriu és de les 189 dels exàmens **vigents** (2025-2026): és on
 * viu la matriu probatòria, l'empremta segellada i les explicacions. Els 24
 * quadernets històrics (2016-2024) es van transcriure després, amb la
 * mateixa disciplina de no inventar mai una resposta, però sense repetir
 * aquí aquell treball —viuen al seu propi test, `tests/content/content.test.ts`—.
 * Filtrar per any evita que aquest fitxer intenti demostrar coses que no ha
 * revisat.
 */
const CURRENT_YEARS = new Set([2025, 2026])
const ALL_OFFICIAL = ROSES_PACK.questions.filter((q) => q.officialExam !== undefined)
const OFFICIAL = ALL_OFFICIAL.filter((q) => CURRENT_YEARS.has(q.officialExam!.year))
const byId = new Map(OFFICIAL.map((q) => [q.questionId, q]))
// El mateix filtre per any: `evidenceMap.decisions` ara en porta 819 (189 +
// 630 històriques) i aquest fitxer només audita les 189 vigents.
const DECISIONS = Object.fromEntries(
  Object.entries(ALL_DECISIONS).filter(([id]) => byId.has(id)),
) as Record<string, Decision>

/** Un dia qualsevol posterior a l'últim examen, per a les proves de vigència. */
const AVUI = '2026-08-25'
/** El dia de l'examen d'interins de 2025, per mirar enrere amb el rellotge. */
const DIA_EXAMEN_2025 = '2025-04-16'

describe('les 189 preguntes oficials i la matriu no es poden separar', () => {
  it('hi ha exactament 189 preguntes d’examen oficial al banc', () => {
    expect(OFFICIAL).toHaveLength(189)
  })

  it('cada una té decisió i cap decisió sobra', () => {
    const sensedecisio = OFFICIAL.filter((q) => !DECISIONS[q.questionId]).map((q) => q.questionId)
    const orfes = Object.keys(DECISIONS).filter((id) => !byId.has(id))
    expect(sensedecisio).toEqual([])
    expect(orfes).toEqual([])
  })

  it('el repartiment per estat és el revisat, no un altre', () => {
    const totals: Record<string, number> = {}
    for (const d of Object.values(DECISIONS)) totals[d.status] = (totals[d.status] ?? 0) + 1
    expect(totals).toEqual({
      'supported-current': 116,
      'general-knowledge': 33,
      'historical-current-affairs': 28,
      'pending-evidence': 4,
      'partially-supported': 4,
      'official-key-conflicts-with-law-at-exam': 2,
      'out-of-syllabus': 2,
    })
    expect(Object.values(totals).reduce((a, b) => a + b, 0)).toBe(189)
  })
})

describe('el que va publicar el tribunal es conserva byte a byte', () => {
  it('l’empremta del text oficial no s’ha mogut', () => {
    // Mateixa funció que fa servir `npm run content:matrix`: si cadascú es
    // calculés la seva, el dia que divergissin ningú sabria quina val.
    expect(officialFingerprint(OFFICIAL)).toBe(SEALED)
  })

  it('la clau del banc és la del tribunal, també quan la norma diu una altra cosa', () => {
    for (const q of OFFICIAL) {
      const meta = q.officialExam!
      if (meta.officialAnswer === 'anullada') continue
      expect(q.correct, q.questionId).toBe(meta.officialAnswer)
      expect(officialVerdict(q, AVUI).scoringAnswer, q.questionId).toBe(meta.officialAnswer)
    }
  })
})

describe('afirmar costa una cita; no saber-ho costa dir què falta', () => {
  it('cap estat demostrat existeix sense citació', () => {
    const nues = Object.entries(DECISIONS)
      .filter(([, d]) => d.status === 'supported-current' && (d.citations ?? []).length === 0)
      .map(([id]) => id)
    expect(nues).toEqual([])
  })

  it('tota citació porta font, localitzador i el fragment literal', () => {
    const sourceIds = new Set(ROSES_PACK.sources.map((s) => s.sourceId))
    for (const [id, d] of Object.entries(DECISIONS)) {
      for (const c of d.citations ?? []) {
        expect(sourceIds.has(c.sourceId), `${id} cita ${c.sourceId}`).toBe(true)
        expect(c.locator.length, id).toBeGreaterThan(0)
        expect(c.quote.length, `${id}::${c.sourceId}`).toBeGreaterThan(9)
      }
    }
  })

  it('cap citació s’aguanta en una de les dues descàrregues buides', () => {
    const trencades = new Set(
      adoption.sources.filter((s) => !s.textExtracted).map((s) => s.sourceId),
    )
    const dolentes = Object.entries(DECISIONS)
      .flatMap(([id, d]) => (d.citations ?? []).map((c) => ({ id, sourceId: c.sourceId })))
      .filter((r) => trencades.has(r.sourceId))
    expect(dolentes).toEqual([])
  })

  it('les quatre pendents diuen què els falta i segueixen pendents', () => {
    const pendents = Object.entries(DECISIONS).filter(([, d]) => d.status === 'pending-evidence')
    expect(pendents).toHaveLength(4)
    for (const [id, d] of pendents) {
      expect(d.missing, id).toBeTruthy()
      expect(d.missing!.length, id).toBeGreaterThan(9)
      // Una pendent no pot portar explicació: seria escriure el fonament que
      // precisament no s'ha pogut demostrar.
      expect(d.explain, id).toBeUndefined()
      expect(officialVerdict(byId.get(id)!, AVUI).usableForCurrentLearning, id).toBe(false)
    }
  })

  it('una discrepància ha de dir quina norma regia i què hi deia', () => {
    const conflictes = Object.entries(DECISIONS).filter(
      ([, d]) => d.status === 'official-key-conflicts-with-law-at-exam',
    )
    expect(conflictes).toHaveLength(2)
    for (const [id, d] of conflictes) {
      expect(d.lawAtExam, id).toBeTruthy()
      expect(d.currentLawAnswer, id).toBeTruthy()
      expect((d.citations ?? []).length, id).toBeGreaterThan(0)
    }
  })
})

describe('els dos casos on la plantilla i la norma no coincideixen', () => {
  it('venedors ambulants 2025: la clau segueix sent la b) i la norma no en té cap', () => {
    const q = byId.get('q-of-roses-2025-interins-cp-036')!
    const d = DECISIONS['q-of-roses-2025-interins-cp-036']!
    // El que va publicar el tribunal: greu, 750 €.
    expect(q.officialExam!.officialAnswer).toBe('b')
    expect(q.correct).toBe('b')
    // La modificació de 2021 va rebaixar la fila a lleu, 500 €, i cap opció
    // ho diu: sota la norma vigent el dia de l'examen no hi havia resposta.
    expect(d.changedOn).toBe('2021-03-19')
    expect(d.currentLawAnswer).toBe('cap')
    // I el canvi és anterior a l'examen: per això és discrepància i no una
    // reforma posterior que hauria deixat la plantilla bona aquell dia.
    expect(Date.parse(d.changedOn!)).toBeLessThan(Date.parse(DIA_EXAMEN_2025))

    const verdicte = officialVerdict(q, AVUI)
    expect(verdicte.notice).toBe('key-conflict')
    expect(verdicte.scoringAnswer).toBe('b')
    expect(verdicte.currentLawAnswer).toBe('cap')
    expect(verdicte.usableForCurrentLearning).toBe(false)
    expect(verdicte.countsForMastery).toBe(false)
    expect(verdicte.canGenerateReview).toBe(false)
  })

  it('Consell de Política de Seguretat: la norma no ha canviat mai i apunta a la c)', () => {
    const q = byId.get('q-of-roses-2025-interins-cp-023')!
    const d = DECISIONS['q-of-roses-2025-interins-cp-023']!
    expect(q.officialExam!.officialAnswer).toBe('d')
    expect(d.currentLawAnswer).toBe('c')
    // Cap reforma: la discrepància ja existia el dia de l'examen.
    expect(d.changedOn).toBeUndefined()
    // I per això el veredicte és el mateix mirant el dia de l'examen o avui.
    for (const dia of [DIA_EXAMEN_2025, AVUI]) {
      expect(officialVerdict(q, dia).notice, dia).toBe('key-conflict')
      expect(officialVerdict(q, dia).scoringAnswer, dia).toBe('d')
    }
  })

  it('triar el que sosté la norma no genera repàs, i triar la plantilla tampoc', () => {
    const q = byId.get('q-of-roses-2025-interins-cp-023')!
    // Ni encertant la plantilla ni «fallant-la» amb la lletra que diu la norma.
    expect(shouldQueueReview(q, 'd', AVUI)).toBe(false)
    expect(shouldQueueReview(q, 'c', AVUI)).toBe(false)
    expect(shouldQueueReview(q, 'a', AVUI)).toBe(false)
  })

  it('en canvi una pregunta normal sí que en genera quan es falla', () => {
    const q = byId.get('q-of-roses-2025-interins-cp-001')!
    expect(shouldQueueReview(q, q.correct, AVUI)).toBe(false)
    expect(shouldQueueReview(q, q.correct === 'a' ? 'b' : 'a', AVUI)).toBe(true)
  })
})

describe('el rellotge decideix, i sempre entra com a paràmetre', () => {
  it('l’actualitat del dia de l’examen valia aquell dia i no val avui', () => {
    const historica = OFFICIAL.filter(
      (q) => DECISIONS[q.questionId]?.status === 'historical-current-affairs',
    )
    expect(historica).toHaveLength(28)
    for (const q of historica) {
      expect(officialVerdict(q, AVUI).usableForCurrentLearning, q.questionId).toBe(false)
      expect(officialVerdict(q, AVUI).notice, q.questionId).toBe('historical')
    }
  })

  it('el fons vigent són 121 preguntes, ni una més', () => {
    const pool = currentLearningPool(OFFICIAL, AVUI)
    expect(pool).toHaveLength(121)
    for (const q of pool) {
      const status = DECISIONS[q.questionId]!.status
      expect(
        ['supported-current', 'out-of-syllabus', 'partially-supported'].includes(status),
        `${q.questionId} (${status})`,
      ).toBe(true)
    }
  })
})

describe('una pregunta amb discrepància no es cola a l’estudi vigent', () => {
  const conflicte = byId.get('q-of-roses-2025-interins-cp-036')!
  const actives = ROSES_PACK.questions.filter((q) => q.status === 'active')

  it('cap mode d’estudi normal la serveix, ni demanant-li el tema', () => {
    for (const mode of ['patrulla', 'per-tema', 'preguntes-noves'] as const) {
      const sessio = selectSession({
        mode,
        pool: actives,
        reviews: new Map(),
        today: 20_000,
        topicIds: [conflicte.topicId],
        size: 50,
        seed: 'matriu',
        todayIso: AVUI,
      })
      // El tema existeix i té preguntes: la sessió no és buida per casualitat.
      expect(sessio.length, mode).toBeGreaterThan(0)
      expect(sessio.map((q) => q.questionId), mode).not.toContain(conflicte.questionId)
    }
  })

  it('ni el constructor de quadernets, que és on es puntua', () => {
    const paper: Question[] = buildExamPaper({
      pool: actives,
      track: 'coneixements-professionals',
      count: 200,
      seed: 'matriu',
      todayIso: AVUI,
    })
    expect(paper.length).toBeGreaterThan(0)
    expect(paper.map((q) => q.questionId)).not.toContain(conflicte.questionId)
  })

  /*
   * Demanar **expressament** material d'examen oficial és una altra cosa: és
   * consultar història, i llavors sí que se serveix —amb la mateixa porta que
   * ja obria l'actualitat dels quadernets antics—. El que no pot passar és que
   * se serveixi en silenci: el veredicte que arriba a la correcció ha de dir
   * que la plantilla i la norma no coincideixen, perquè és el que fa que la
   * pantalla ensenyi les dues capes en lloc d'un ✓ o una ✕.
   */
  it('demanant-la com a material oficial sí que surt, i avisada', () => {
    // `size` ha de cobrir tot el banc oficial —ara amb els 24 quadernets
    // històrics ja transcrits, no només els 189 vigents— perquè un límit
    // més curt convertiria la comprovació en una mostra aleatòria.
    const sessio = selectSession({
      mode: 'per-tema',
      pool: actives,
      reviews: new Map(),
      today: 20_000,
      size: actives.length,
      seed: 'matriu',
      todayIso: AVUI,
      filters: { onlyOfficialExam: true },
    })
    expect(sessio.map((q) => q.questionId)).toContain(conflicte.questionId)
    expect(officialVerdict(conflicte, AVUI).notice).toBe('key-conflict')
  })

  it('i encara servida, no compta per al domini ni genera repàs', () => {
    const verdicte = officialVerdict(conflicte, AVUI)
    expect(verdicte.countsForMastery).toBe(false)
    expect(verdicte.canGenerateReview).toBe(false)
  })

  it('sense rellotge el motor no filtra res per vigència, com sempre', () => {
    // Els tests antics no passen `todayIso`: el motor ha de continuar sent pur
    // i no inventar-se un «avui» quan no n'hi donen cap.
    const sense = selectSession({
      mode: 'per-tema',
      pool: [conflicte],
      reviews: new Map(),
      today: 20_000,
      seed: 'matriu',
    })
    expect(sense.map((q) => q.questionId)).toContain(conflicte.questionId)
  })
})

describe('les explicacions ensenyen i porten on comprovar-ho', () => {
  const ambExplicacio = Object.entries(DECISIONS).filter(([, d]) => d.explain)

  it('n’hi ha 124 i totes són d’una pregunta demostrable', () => {
    expect(ambExplicacio).toHaveLength(124)
    for (const [id, d] of ambExplicacio) {
      expect(
        ['supported-current', 'partially-supported', 'out-of-syllabus', 'official-key-conflicts-with-law-at-exam'].includes(
          d.status,
        ),
        `${id} (${d.status})`,
      ).toBe(true)
      expect((d.citations ?? []).length, id).toBeGreaterThan(0)
    }
  })

  it('cada explicació és bilingüe i prou llarga per dir alguna cosa', () => {
    for (const [id, d] of ambExplicacio) {
      expect(d.explain!.ca.length, `${id}/ca`).toBeGreaterThan(120)
      expect(d.explain!.es.length, `${id}/es`).toBeGreaterThan(120)
      // El text de procedència deia d'on venia la pregunta. Una explicació que
      // torni a dir això no explica res.
      expect(d.explain!.ca, id).not.toContain('El tribunal va marcar')
    }
  })

  it('la pregunta del banc porta l’explicació escrita, no la de procedència', () => {
    for (const [id, d] of ambExplicacio) {
      expect(byId.get(id)!.explanation.ca, id).toBe(d.explain!.ca)
      expect(byId.get(id)!.explanation.es, id).toBe(d.explain!.es)
    }
  })

  it('i arrossega la norma citada com a referència verificada', () => {
    for (const [id, d] of ambExplicacio) {
      const refs = byId.get(id)!.references
      for (const c of d.citations ?? []) {
        const ref = refs.find((r) => r.sourceId === c.sourceId && r.locator === c.locator)
        expect(ref, `${id} → ${c.sourceId} ${c.locator}`).toBeDefined()
        expect(ref!.reviewStatus, id).toBe('verified')
      }
    }
  })

  it('les 65 sense explicació conserven el text que diu què se’n sap', () => {
    const sense = OFFICIAL.filter((q) => !DECISIONS[q.questionId]?.explain)
    expect(sense).toHaveLength(65)
    for (const q of sense) {
      expect(q.explanation.ca, q.questionId).toContain('El tribunal va marcar')
    }
  })
})
