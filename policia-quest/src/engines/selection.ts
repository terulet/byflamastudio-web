/**
 * Selecció determinista de preguntes per a una sessió.
 *
 * Prioritat general (de més a menys urgent):
 *
 *   1. Repassos vençuts, ordenats per `reviewPriority`.
 *   2. Preguntes fallades no vençudes encara (lapses > 0), les més recents.
 *   3. Preguntes noves, en ordre de tema per no saltar pel temari.
 *   4. Reforç: preguntes ja vistes però amb força baixa.
 *
 * La barreja final és determinista a partir d'una llavor, de manera que la
 * mateixa sessió es pot reconstruir si l'app es tanca.
 */
import { isDue, reviewPriority } from './srs.ts'
import { makeRng, seedFromString, shuffle } from '../util/rng.ts'
import type { Question, ReviewState, StudyMode } from '../domain/types.ts'
import { isCurrent } from './availability.ts'

export interface SelectionInput {
  mode: StudyMode
  /** Banc de preguntes ja filtrat a les actives i al municipi. */
  pool: readonly Question[]
  reviews: ReadonlyMap<string, ReviewState>
  today: number
  /** Restricció per tema (mode `per-tema` i filtres). */
  topicIds?: readonly string[]
  /** Sobreescriu la mida per defecte del mode. */
  size?: number
  /** Llavor per fer la barreja reproduïble. */
  seed?: string
  /** Filtres addicionals de la pantalla Entrenar. */
  filters?: SessionFilters
  /**
   * Dia ISO, per deixar fora el contingut dinàmic caducat.
   *
   * Si no s'indica, no es filtra per vigència: els tests que no en parlen
   * segueixen valent i el motor continua sent pur.
   */
  todayIso?: string
}

/** Filtres de la pantalla Entrenar. Tots són opcionals i acumulatius. */
export interface SessionFilters {
  track?: 'cultura-general' | 'coneixements-professionals'
  difficulty?: 'facil' | 'mitjana' | 'dificil'
  origin?: 'authored' | 'official'
  onlyOfficialExam?: boolean
  /**
   * Estat de la pregunta per a qui estudia:
   *  - `new`    : mai vista.
   *  - `failed` : amb errors acumulats o marcada per repassar.
   *  - `due`    : vençuda per repassar.
   */
  state?: 'new' | 'failed' | 'due'
}

/** Mida per defecte de cada mode. */
export const MODE_SIZE: Record<StudyMode, number> = {
  'no-tinc-ganes': 3,
  'sessio-expres': 5,
  'missio-del-dia': 10,
  patrulla: 20,
  'per-tema': 10,
  errors: 15,
  repassos: 20,
  'preguntes-noves': 10,
}

interface Bucketed {
  due: Question[]
  failing: Question[]
  fresh: Question[]
  weak: Question[]
}

function bucket(
  pool: readonly Question[],
  reviews: ReadonlyMap<string, ReviewState>,
  today: number,
): Bucketed {
  const due: Question[] = []
  const failing: Question[] = []
  const fresh: Question[] = []
  const weak: Question[] = []

  for (const q of pool) {
    const state = reviews.get(q.questionId)
    if (!state || state.reps === 0) {
      fresh.push(q)
      continue
    }
    if (isDue(state, today)) {
      due.push(q)
      continue
    }
    if (state.lapses > 0 || state.flagged) {
      failing.push(q)
      continue
    }
    weak.push(q)
  }

  const priority = (q: Question): number => {
    const state = reviews.get(q.questionId)
    return state ? reviewPriority(state, today) : 0
  }
  due.sort((a, b) => priority(b) - priority(a))
  failing.sort((a, b) => {
    const sa = reviews.get(a.questionId)
    const sb = reviews.get(b.questionId)
    return (sb?.lapses ?? 0) - (sa?.lapses ?? 0)
  })
  // Les noves segueixen l'ordre del temari.
  fresh.sort((a, b) => a.questionId.localeCompare(b.questionId))
  weak.sort((a, b) => {
    const sa = reviews.get(a.questionId)
    const sb = reviews.get(b.questionId)
    return (sa?.intervalStep ?? 0) - (sb?.intervalStep ?? 0)
  })

  return { due, failing, fresh, weak }
}

function applyFilters(input: SelectionInput): Question[] {
  const { pool, topicIds, filters, reviews, today } = input
  const topicSet = topicIds && topicIds.length > 0 ? new Set(topicIds) : null
  /*
   * El contingut caducat no entra a una sessió normal.
   *
   * Mig quadernet de cultura general són preguntes com «qui és l'actual
   * ministre/a de Defensa?». Són certes el dia de l'examen. Servir-les després
   * en una sessió d'estudi, sense data i barrejades amb dret vigent, és
   * ensenyar un fet fals.
   *
   * L'excepció és quan algú demana **expressament** material d'examen oficial:
   * aleshores està consultant història, i la interfície n'ensenya la data.
   */
  const wantsHistorical = filters?.origin === 'official' || filters?.onlyOfficialExam === true
  const todayIso = input.todayIso

  return pool.filter((q) => {
    if (q.status !== 'active') return false
    if (!wantsHistorical && todayIso !== undefined && !isCurrent(q, todayIso)) return false
    if (topicSet && !topicSet.has(q.topicId)) return false
    if (filters?.track && q.track !== filters.track) return false
    if (filters?.difficulty && q.difficulty !== filters.difficulty) return false
    if (filters?.origin && q.origin !== filters.origin) return false
    if (filters?.onlyOfficialExam && !q.officialExam) return false

    if (filters?.state) {
      const state = reviews.get(q.questionId)
      const seen = state !== undefined && state.reps > 0
      if (filters.state === 'new' && seen) return false
      if (filters.state === 'failed' && (!state || (state.lapses === 0 && !state.flagged))) return false
      if (filters.state === 'due' && !(state && isDue(state, today))) return false
    }

    return true
  })
}

/**
 * Tria les preguntes d'una sessió. Retorna com a molt `size` preguntes;
 * si no n'hi ha prou de la categoria demanada, en retorna menys (i mai
 * repeteix cap pregunta).
 */
export function selectSession(input: SelectionInput): Question[] {
  const size = input.size ?? MODE_SIZE[input.mode]
  const filtered = applyFilters(input)
  const { due, failing, fresh, weak } = bucket(filtered, input.reviews, input.today)

  let ordered: Question[]

  switch (input.mode) {
    case 'repassos':
      ordered = due
      break
    case 'errors':
      // Fallades: vençudes amb errors primer, després la resta amb errors.
      ordered = [
        ...due.filter((q) => (input.reviews.get(q.questionId)?.lapses ?? 0) > 0),
        ...failing,
      ]
      break
    case 'preguntes-noves':
      ordered = fresh
      break
    case 'no-tinc-ganes':
      // Sessió mínima: el més urgent, sense contingut nou que exigeixi energia.
      ordered = [...due, ...failing, ...weak, ...fresh]
      break
    case 'missio-del-dia':
    case 'patrulla':
    case 'sessio-expres':
    case 'per-tema':
    default:
      ordered = interleave(due, failing, fresh, weak, size)
      break
  }

  const picked = dedupe(ordered).slice(0, size)
  const rng = makeRng(seedFromString(input.seed ?? `${input.mode}:${input.today}`))
  // Es barreja l'ordre de presentació, però el conjunt triat és determinista.
  return shuffle(picked, rng)
}

/**
 * Combina els grups respectant una proporció objectiu: primer els repassos
 * vençuts (fins a la meitat de la sessió), després els errors, i s'omple amb
 * contingut nou. Si una categoria és buida, la següent n'ocupa el lloc.
 */
function interleave(
  due: readonly Question[],
  failing: readonly Question[],
  fresh: readonly Question[],
  weak: readonly Question[],
  size: number,
): Question[] {
  const out: Question[] = []
  const dueQuota = Math.ceil(size * 0.5)
  const failQuota = Math.ceil(size * 0.2)

  out.push(...due.slice(0, dueQuota))
  out.push(...failing.slice(0, failQuota))
  out.push(...fresh.slice(0, size - out.length))
  // Si encara falta, s'omple amb el que quedi de cada grup.
  if (out.length < size) out.push(...due.slice(dueQuota))
  if (out.length < size) out.push(...failing.slice(failQuota))
  if (out.length < size) out.push(...weak)
  return out
}

function dedupe(items: readonly Question[]): Question[] {
  const seen = new Set<string>()
  const out: Question[] = []
  for (const q of items) {
    if (seen.has(q.questionId)) continue
    seen.add(q.questionId)
    out.push(q)
  }
  return out
}

/** Nombre de repassos vençuts ara mateix, per a la pantalla d'inici. */
export function countDue(
  pool: readonly Question[],
  reviews: ReadonlyMap<string, ReviewState>,
  today: number,
): number {
  let n = 0
  for (const q of pool) {
    if (q.status !== 'active') continue
    const state = reviews.get(q.questionId)
    if (state && isDue(state, today)) n++
  }
  return n
}

/** Nombre de preguntes amb errors acumulats. */
export function countFailed(
  pool: readonly Question[],
  reviews: ReadonlyMap<string, ReviewState>,
): number {
  let n = 0
  for (const q of pool) {
    if (q.status !== 'active') continue
    const state = reviews.get(q.questionId)
    if (state && state.lapses > 0) n++
  }
  return n
}

/**
 * Munta un simulacre a partir d'un plànol d'examen.
 *
 * Si el plànol fixa una composició —la de cultura general de Roses són 10
 * preguntes de cultura general i 10 d'actualitat— cada quota es cobreix **per
 * separat**. Que en sobrin d'una no pot tapar que en faltin d'una altra: el
 * tribunal no les intercanvia i el simulacre tampoc.
 *
 * Quan una quota no es pot cobrir, aquesta funció no la substitueix per
 * preguntes d'una altra. Munta el que pugui i deixa el buit; qui decideix si
 * la prova s'ofereix o es bloqueja és `examAvailability`, i la pantalla de
 * simulacres no arriba a demanar un quadernet que no es pot muntar.
 */
export function buildExamPaper(opts: {
  pool: readonly Question[]
  track: 'cultura-general' | 'coneixements-professionals'
  count: number
  /**
   * Preguntes de reserva, que van al final del quadernet.
   *
   * Es contesten igual que les altres —el dia de l'examen no se salten— però
   * queden fora de la nota mentre el tribunal no anul·li res. Van a la cua i
   * no barrejades: així és com surten al quadernet real, i així el motor de
   * puntuació pot tallar per índex sense haver de marcar cada pregunta.
   */
  reserveCount?: number
  /** Quotes per etiqueta que fixa la convocatòria, si en fixa cap. */
  composition?: readonly { tag: string; count: number }[]
  /** Dia ISO, per descartar el contingut dinàmic que ja ha caducat. */
  todayIso?: string
  seed: string
  /** Preguntes ja usades en una altra secció del mateix quadernet. */
  exclude?: readonly string[]
}): Question[] {
  const excluded = opts.exclude && opts.exclude.length > 0 ? new Set(opts.exclude) : null
  const today = opts.todayIso
  const candidates = opts.pool.filter(
    (q) =>
      q.status === 'active' &&
      q.track === opts.track &&
      !excluded?.has(q.questionId) &&
      (today === undefined || isCurrent(q, today)),
  )
  const rng = makeRng(seedFromString(opts.seed))
  const reserveCount = opts.reserveCount ?? 0

  const taken = new Set<string>()
  /** Pren `n` preguntes repartint-les entre temes, sense repetir-ne cap. */
  const draw = (from: readonly Question[], n: number): Question[] => {
    if (n <= 0) return []
    const byTopic = new Map<string, Question[]>()
    for (const q of shuffle(from.filter((q) => !taken.has(q.questionId)), rng)) {
      const list = byTopic.get(q.topicId)
      if (list) list.push(q)
      else byTopic.set(q.topicId, [q])
    }
    const topics = shuffle([...byTopic.keys()], rng)

    const out: Question[] = []
    let round = 0
    while (out.length < n) {
      let addedThisRound = 0
      for (const topicId of topics) {
        if (out.length >= n) break
        const q = byTopic.get(topicId)?.[round]
        if (q) {
          out.push(q)
          taken.add(q.questionId)
          addedThisRound++
        }
      }
      if (addedThisRound === 0) break // s'ha exhaurit el banc
      round++
    }
    return out
  }

  const body: Question[] =
    opts.composition && opts.composition.length > 0
      ? opts.composition.flatMap((slot) =>
          draw(candidates.filter((q) => q.tags.includes(slot.tag)), slot.count),
        )
      : draw(candidates, opts.count)

  // El cos es barreja abans de treure la reserva perquè demanar reserva no
  // pugui reordenar la prova: amb la mateixa llavor, les preguntes del cos
  // surten en el mateix ordre hi hagi reserva o no.
  const bodyShuffled = shuffle(body, rng)

  // Si el banc no dona per a tot, les reserves són el primer que se sacrifica:
  // el cos principal de la prova té prioritat sobre unes preguntes que, per
  // defecte, ni tan sols compten.
  const reserve = body.length < opts.count ? [] : draw(candidates, reserveCount)

  return [...bodyShuffled, ...shuffle(reserve, rng)]
}
