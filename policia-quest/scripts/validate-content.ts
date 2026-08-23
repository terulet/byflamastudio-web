/**
 * Validació de contingut. `npm run content:validate`.
 *
 * Aquest script és la barrera de qualitat de la Content Factory. Surt amb codi
 * d'error —i, per tant, trenca `npm run check`— si es dona qualsevol d'aquests
 * casos:
 *
 *   1. No hi ha exactament 40 temes de Roses.
 *   2. Hi ha identificadors duplicats (temes, lliçons, preguntes, fonts, exàmens).
 *   3. Falta la resposta correcta d'alguna pregunta.
 *   4. Una pregunta activa no té cap referència.
 *   5. Hi ha menys de 4 preguntes actives per a algun tema.
 *   6. Un examen oficial importat no conserva les seves metadades.
 *   7. Una pregunta dinàmica està activa sense data de revisió.
 *   8. Una referència apunta a una font que no existeix al manifest.
 *   9. Els plànols de simulacre no respecten les regles de puntuació de Roses.
 *  10. Hi ha enunciats duplicats segons el hash normalitzat.
 *  11. Falta la microlliçó d'algun tema.
 */
import {
  CurrentAffairsPack,
  ExamBlueprint,
  Lesson,
  OfficialExam,
  Question,
  SourceManifest,
  Syllabus,
} from '../content/schemas/index.ts'
import { ROSES_PACK } from '../content/municipalities/roses/index.ts'
import manifestJson from '../sources/source-manifest.json' with { type: 'json' }
import { CONEIXEMENTS_SCORING, CULTURA_GENERAL_SCORING } from '../src/engines/scoring.ts'
import { normalizeStem, dedupeHash } from './lib/dedupe.ts'

const errors: string[] = []
const warnings: string[] = []

function fail(message: string): void {
  errors.push(message)
}
function warn(message: string): void {
  warnings.push(message)
}

/* ---------------- 0. Esquemes ---------------- */

const manifest = SourceManifest.safeParse(manifestJson)
if (!manifest.success) {
  for (const issue of manifest.error.issues) {
    fail(`manifest de fonts: ${issue.path.join('.')} — ${issue.message}`)
  }
}

const syllabus = Syllabus.safeParse(ROSES_PACK.syllabus)
if (!syllabus.success) {
  for (const issue of syllabus.error.issues) {
    fail(`temari: ${issue.path.join('.')} — ${issue.message}`)
  }
}

for (const lesson of ROSES_PACK.lessons) {
  const parsed = Lesson.safeParse(lesson)
  if (!parsed.success) {
    fail(`lliçó ${lesson.lessonId}: ${parsed.error.issues[0]?.message ?? 'invàlida'}`)
  }
}

for (const question of ROSES_PACK.questions) {
  const parsed = Question.safeParse(question)
  if (!parsed.success) {
    fail(`pregunta ${question.questionId}: ${parsed.error.issues[0]?.message ?? 'invàlida'}`)
  }
}

for (const exam of ROSES_PACK.exams) {
  const parsed = OfficialExam.safeParse(exam)
  if (!parsed.success) {
    fail(`examen ${exam.examId}: ${parsed.error.issues[0]?.message ?? 'invàlid'}`)
  }
}

for (const blueprint of ROSES_PACK.blueprints) {
  const parsed = ExamBlueprint.safeParse(blueprint)
  if (!parsed.success) {
    fail(`plànol ${blueprint.blueprintId}: ${parsed.error.issues[0]?.message ?? 'invàlid'}`)
  }
}

for (const pack of ROSES_PACK.currentAffairs) {
  const parsed = CurrentAffairsPack.safeParse(pack)
  if (!parsed.success) {
    fail(`paquet d’actualitat ${pack.packId}: ${parsed.error.issues[0]?.message ?? 'invàlid'}`)
  }
}

/* ---------------- 1. Exactament 40 temes ---------------- */

const topics = ROSES_PACK.syllabus.topics
if (topics.length !== 40) {
  fail(`el temari de Roses ha de tenir exactament 40 temes; en té ${topics.length}`)
}

const numbers = topics.map((t) => t.number).sort((a, b) => a - b)
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] !== i + 1) {
    fail(`la numeració del temari no és consecutiva d’1 a 40 (falla al ${i + 1})`)
    break
  }
}

const numbers2025 = new Set(topics.map((t) => t.number2025))
if (numbers2025.size !== 40) {
  fail('l’equivalència amb la numeració de 2025 té valors duplicats o incomplets')
}

/* ---------------- 2. Identificadors duplicats ---------------- */

function assertUnique(label: string, ids: readonly string[]): void {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) fail(`${label}: identificador duplicat "${id}"`)
    seen.add(id)
  }
}

assertUnique('temes', topics.map((t) => t.topicId))
assertUnique('lliçons', ROSES_PACK.lessons.map((l) => l.lessonId))
assertUnique('preguntes', ROSES_PACK.questions.map((q) => q.questionId))
assertUnique('exàmens', ROSES_PACK.exams.map((e) => e.examId))
assertUnique('fonts', ROSES_PACK.sources.map((s) => s.sourceId))
assertUnique('plànols', ROSES_PACK.blueprints.map((b) => b.blueprintId))

/* ---------------- 3, 4, 7, 8. Preguntes ---------------- */

const sourceIds = new Set(ROSES_PACK.sources.map((s) => s.sourceId))
const topicIds = new Set(topics.map((t) => t.topicId))

for (const q of ROSES_PACK.questions) {
  if (!topicIds.has(q.topicId)) {
    fail(`pregunta ${q.questionId}: apunta a un tema inexistent "${q.topicId}"`)
  }

  const correctOption = q.options.find((o) => o.optionId === q.correct)
  if (!correctOption) {
    fail(`pregunta ${q.questionId}: no hi ha cap opció que correspongui a la resposta correcta`)
  }

  const letters = q.options.map((o) => o.optionId).sort().join('')
  if (letters !== 'abcd') {
    fail(`pregunta ${q.questionId}: les opcions han de ser exactament a, b, c i d`)
  }

  if (q.status === 'active') {
    if (q.references.length === 0) {
      fail(`pregunta activa ${q.questionId}: sense cap referència a una font`)
    }
    if (q.dynamic && !q.reviewBy) {
      fail(`pregunta dinàmica activa ${q.questionId}: sense data de revisió (reviewBy)`)
    }
  }

  for (const r of q.references) {
    if (!sourceIds.has(r.sourceId)) {
      fail(`pregunta ${q.questionId}: referència a una font inexistent "${r.sourceId}"`)
    }
  }

  if (q.origin === 'official' && !q.officialExam) {
    fail(`pregunta oficial ${q.questionId}: sense metadades d’examen`)
  }
}

/* ---------------- 5. Mínim de preguntes actives per tema ---------------- */

const MIN_PER_TOPIC = 4
const activeByTopic = new Map<string, number>()
for (const q of ROSES_PACK.questions) {
  if (q.status !== 'active') continue
  activeByTopic.set(q.topicId, (activeByTopic.get(q.topicId) ?? 0) + 1)
}
for (const topic of topics) {
  const n = activeByTopic.get(topic.topicId) ?? 0
  if (n < MIN_PER_TOPIC) {
    fail(`tema ${topic.number} (${topic.topicId}): només ${n} preguntes actives, en calen ${MIN_PER_TOPIC}`)
  }
}

const totalActive = [...activeByTopic.values()].reduce((a, b) => a + b, 0)
const MIN_TOTAL_ACTIVE = 200
if (totalActive < MIN_TOTAL_ACTIVE) {
  fail(`el banc actiu té ${totalActive} preguntes; el mínim acceptat és ${MIN_TOTAL_ACTIVE}`)
}

/* ---------------- 6. Exàmens oficials ---------------- */

const questionsById = new Map(ROSES_PACK.questions.map((q) => [q.questionId, q]))

for (const exam of ROSES_PACK.exams) {
  if (!sourceIds.has(exam.sourceId)) {
    fail(`examen ${exam.examId}: apunta a una font inexistent "${exam.sourceId}"`)
  }

  if (exam.importStatus === 'pending-source') {
    if (exam.questionIds.length > 0) {
      fail(`examen ${exam.examId}: marcat com a pendent però conté preguntes`)
    }
    if (!exam.note) {
      fail(`examen ${exam.examId}: pendent d’importar sense nota que ho expliqui`)
    }
    continue
  }

  if (exam.questionIds.length === 0) {
    fail(`examen ${exam.examId}: marcat com a importat però sense preguntes`)
  }

  for (const qid of exam.questionIds) {
    const q = questionsById.get(qid)
    if (!q) {
      fail(`examen ${exam.examId}: la pregunta "${qid}" no existeix al banc`)
      continue
    }
    if (!q.officialExam) {
      fail(`examen ${exam.examId}: la pregunta "${qid}" ha perdut les metadades d’examen`)
      continue
    }
    const meta = q.officialExam
    if (meta.examId !== exam.examId) fail(`pregunta ${qid}: examId no coincideix amb l’examen`)
    if (meta.year !== exam.year) fail(`pregunta ${qid}: any no coincideix amb l’examen`)
    if (meta.placeType !== exam.placeType) fail(`pregunta ${qid}: tipus de plaça no coincideix`)
    if (meta.testType !== exam.testType) fail(`pregunta ${qid}: tipus de prova no coincideix`)
    if (!Number.isInteger(meta.originalNumber) || meta.originalNumber < 1) {
      fail(`pregunta ${qid}: número original de quadernet no vàlid`)
    }
    if (meta.officialAnswer !== 'anullada' && meta.officialAnswer !== q.correct && !meta.transcriptionNotes) {
      fail(`pregunta ${qid}: divergeix de la resposta oficial sense justificació documentada`)
    }
    if (q.status === 'active') {
      warn(`pregunta ${qid}: procedent d’un examen històric però marcada com a activa`)
    }
  }

  if (exam.expectedQuestionCount && exam.questionIds.length !== exam.expectedQuestionCount) {
    warn(
      `examen ${exam.examId}: s’esperaven ${exam.expectedQuestionCount} preguntes i n’hi ha ${exam.questionIds.length}`,
    )
  }
}

/* ---------------- 9. Regles de puntuació dels simulacres ---------------- */

const cg = ROSES_PACK.blueprints.find((b) => b.blueprintId === 'roses-cultura-general')
if (!cg) {
  fail('falta el plànol del simulacre de cultura general')
} else {
  if (cg.questionCount !== 20) fail('cultura general: han de ser 20 preguntes')
  if (cg.durationMinutes !== 20) fail('cultura general: han de ser 20 minuts')
  if (cg.scoring.correctMilli !== CULTURA_GENERAL_SCORING.correctMilli) fail('cultura general: encert ha de valer +1')
  if (cg.scoring.wrongMilli !== CULTURA_GENERAL_SCORING.wrongMilli) fail('cultura general: error ha de restar 0,25')
  if (cg.scoring.blankMilli !== 0) fail('cultura general: en blanc ha de valer 0')
  if (cg.scoring.maxScoreMilli !== 20_000) fail('cultura general: el resultat ha de ser sobre 20')
  if (cg.scoring.passMarkMilli !== 10_000) fail('cultura general: l’aprovat ha de ser 10')
  const maxAchievable = cg.questionCount * cg.scoring.correctMilli
  if (maxAchievable !== cg.scoring.maxScoreMilli) {
    fail(`cultura general: 20 encerts donen ${maxAchievable} mil·lipunts i no els ${cg.scoring.maxScoreMilli} declarats`)
  }
}

const cp = ROSES_PACK.blueprints.find((b) => b.blueprintId === 'roses-coneixements-professionals')
if (!cp) {
  fail('falta el plànol del simulacre de coneixements professionals')
} else {
  if (cp.questionCount !== 40) fail('coneixements professionals: han de ser 40 preguntes')
  if (cp.durationMinutes !== 60) fail('coneixements professionals: han de ser 60 minuts')
  if (cp.scoring.correctMilli !== CONEIXEMENTS_SCORING.correctMilli) fail('coneixements professionals: encert ha de valer +0,5')
  if (cp.scoring.wrongMilli !== CONEIXEMENTS_SCORING.wrongMilli) fail('coneixements professionals: error ha de restar 0,125')
  if (cp.scoring.blankMilli !== 0) fail('coneixements professionals: en blanc ha de valer 0')
  if (cp.scoring.maxScoreMilli !== 20_000) fail('coneixements professionals: el resultat ha de ser sobre 20')
  if (cp.scoring.passMarkMilli !== 10_000) fail('coneixements professionals: l’aprovat ha de ser 10')
  if (cp.reserveCount !== 2) fail('coneixements professionals: hi ha d’haver 2 preguntes de reserva')
  const maxAchievable = cp.questionCount * cp.scoring.correctMilli
  if (maxAchievable !== cp.scoring.maxScoreMilli) {
    fail(`coneixements professionals: 40 encerts donen ${maxAchievable} mil·lipunts i no els ${cp.scoring.maxScoreMilli} declarats`)
  }
}

// El banc ha de poder omplir cada simulacre.
for (const bp of ROSES_PACK.blueprints) {
  const available = ROSES_PACK.questions.filter(
    (q) => q.status === 'active' && q.track === bp.track,
  ).length
  if (available < bp.questionCount) {
    fail(
      `plànol ${bp.blueprintId}: calen ${bp.questionCount} preguntes actives de tipus ${bp.track} i només n’hi ha ${available}`,
    )
  }
}

/* ---------------- 10. Deduplicació ---------------- */

const byHash = new Map<string, string>()
for (const q of ROSES_PACK.questions) {
  const hash = dedupeHash(q.stem)
  const previous = byHash.get(hash)
  if (previous) {
    fail(`preguntes ${previous} i ${q.questionId} tenen el mateix enunciat normalitzat`)
  }
  byHash.set(hash, q.questionId)
}

// Similitud alta entre enunciats del mateix tema (avís, no error).
const byTopicStems = new Map<string, Array<{ id: string; norm: string }>>()
for (const q of ROSES_PACK.questions) {
  const list = byTopicStems.get(q.topicId) ?? []
  list.push({ id: q.questionId, norm: normalizeStem(q.stem) })
  byTopicStems.set(q.topicId, list)
}
for (const [topicId, list] of byTopicStems) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]!
      const b = list[j]!
      if (similarity(a.norm, b.norm) > 0.9) {
        warn(`${topicId}: ${a.id} i ${b.id} tenen enunciats molt similars`)
      }
    }
  }
}

/* ---------------- 11. Lliçons ---------------- */

const lessonTopics = new Set(ROSES_PACK.lessons.map((l) => l.topicId))
for (const topic of topics) {
  if (!lessonTopics.has(topic.topicId)) {
    fail(`tema ${topic.number} (${topic.topicId}): sense microlliçó`)
  }
}
for (const lesson of ROSES_PACK.lessons) {
  if (!topicIds.has(lesson.topicId)) {
    fail(`lliçó ${lesson.lessonId}: apunta a un tema inexistent`)
  }
  for (const r of lesson.references) {
    if (!sourceIds.has(r.sourceId)) {
      fail(`lliçó ${lesson.lessonId}: referència a una font inexistent "${r.sourceId}"`)
    }
  }
}

/* ---------------- Similitud de Jaccard sobre paraules ---------------- */

function similarity(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(Boolean))
  const setB = new Set(b.split(' ').filter(Boolean))
  if (setA.size === 0 || setB.size === 0) return 0
  let shared = 0
  for (const word of setA) if (setB.has(word)) shared++
  return shared / (setA.size + setB.size - shared)
}

/* ---------------- Informe ---------------- */

console.log('── Validació de contingut de Policia Quest ──\n')
console.log(`Temes            ${topics.length}`)
console.log(`Microlliçons     ${ROSES_PACK.lessons.length}`)
console.log(`Preguntes        ${ROSES_PACK.questions.length} (${totalActive} actives)`)
console.log(`Exàmens          ${ROSES_PACK.exams.length}`)
console.log(`Fonts            ${ROSES_PACK.sources.length}`)
console.log(`Plànols          ${ROSES_PACK.blueprints.length}\n`)

if (warnings.length > 0) {
  console.log(`Avisos (${warnings.length}):`)
  for (const w of warnings) console.log(`  · ${w}`)
  console.log()
}

if (errors.length > 0) {
  console.error(`ERRORS (${errors.length}):`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  console.error('\nLa validació de contingut ha fallat.')
  process.exit(1)
}

console.log('✓ Totes les comprovacions de contingut han passat.')
