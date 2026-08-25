/**
 * Matriu de les 189 preguntes d'examen oficial. `npm run content:matrix`
 *
 * Uneix el judici probatori d'`official-evidence-map.json` amb les dades que ja
 * viuen al banc —convocatòria, data, secció, número original, tema, clau
 * oficial— i escriu dues sortides: `artifacts/matriu-oficials.json`, per a qui
 * la vulgui llegir amb una màquina, i `artifacts/matriu-oficials.md`, per a qui
 * la vulgui llegir.
 *
 * Les dades del banc **no** es dupliquen al mapa a propòsit. Duplicar-les seria
 * crear una segona versió que se separaria de la primera el primer dia que algú
 * en toqués una, i aquest script no ho podria detectar perquè les dues serien
 * seves. Així, en canvi, si el banc canvia, la matriu canvia amb ell.
 *
 * L'script **falla** —i no escriu res— si passa qualsevol d'aquestes coses:
 *
 *  1. Falta alguna de les 189, o el mapa en jutja una que no existeix.
 *  2. Hi ha identificadors duplicats.
 *  3. Una clau, un enunciat o una opció oficial ha canviat respecte de
 *     l'empremta segellada.
 *  4. Una explicació cita una referència que no està verificada.
 *  5. Es declara vigent alguna cosa sense evidència.
 *  6. Una pregunta conflictiva entra al domini o al repàs.
 *
 * Els punts 3 a 6 no són comprovacions decoratives: cada un correspon a una
 * manera concreta d'espatllar això sense adonar-se'n.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { ROSES_PACK } from '../content/municipalities/roses/index.ts'
import evidenceMap from '../content/municipalities/roses/questions/official-evidence-map.json' with { type: 'json' }
import { officialVerdict } from '../src/engines/official-evidence.ts'
import type { OfficialEvidenceStatus, Question } from '../src/domain/types.ts'

const ROOT = new URL('..', import.meta.url).pathname
const TODAY = new Date().toISOString().slice(0, 10)

const official = ROSES_PACK.questions.filter((q) => q.origin === 'official')
const exams = new Map(ROSES_PACK.exams.map((e) => [e.examId, e]))
const decisions = evidenceMap.decisions as Record<string, { status: string; why: string; citations: { sourceId: string; locator: string; quote: string }[]; lawAtExam?: string; lawToday?: string; changedOn?: string; currentLawAnswer?: string; missing?: string }>

/* ─────────────────────────── Comprovacions ─────────────────────────── */

const failures: string[] = []

// 1 i 2. Les 189, sense duplicats i sense sobrants.
const ids = official.map((q) => q.questionId)
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
if (duplicates.length > 0) failures.push(`identificadors duplicats al banc: ${duplicates.join(', ')}`)
const missing = ids.filter((id) => !decisions[id])
if (missing.length > 0) failures.push(`${missing.length} preguntes sense decisió: ${missing.slice(0, 5).join(', ')}…`)
const orphan = Object.keys(decisions).filter((id) => !ids.includes(id))
if (orphan.length > 0) failures.push(`el mapa jutja preguntes que no existeixen: ${orphan.join(', ')}`)

/**
 * 3. Els textos oficials, byte a byte.
 *
 * L'empremta cobreix identificador, número original, clau del tribunal,
 * enunciat i les quatre opcions en ordre. És el que no es pot moure mai: si
 * canvia, o algú ha «corregit» un document oficial o la transcripció s'ha
 * trencat, i les dues coses s'han de mirar a mà.
 */
const SEALED = '9f762a38733dd48a34fdb714b1d3f75b1492138cf12414c6dd9304e96d1b3576'
function officialFingerprint(questions: readonly Question[]): string {
  const rows = [...questions]
    .sort((a, b) => a.questionId.localeCompare(b.questionId))
    .map((q) => [
      q.questionId,
      q.officialExam!.originalNumber,
      q.officialExam!.officialAnswer,
      q.stem,
      ...q.options.map((o) => o.text),
    ])
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}
const fingerprint = officialFingerprint(official)
const sealCheck = process.argv.includes('--seal')
  ? `segell nou: ${fingerprint}`
  : SEALED === fingerprint
    ? 'els textos oficials no s’han mogut'
    : `L’EMPREMTA DELS TEXTOS OFICIALS HA CANVIAT (${fingerprint}). Reviseu-ho a mà.`
if (!sealCheck.startsWith('els') && !sealCheck.startsWith('segell')) failures.push(sealCheck)

// 4, 5 i 6. Coherència entre el judici, les referències i el motor.
// Les lliçons també verifiquen fonts, i n'hi ha que només elles citen.
const verifiedRefs = new Set(
  [...ROSES_PACK.questions, ...ROSES_PACK.lessons].flatMap((x) =>
    x.references.filter((r) => r.reviewStatus === 'verified').map((r) => r.sourceId),
  ),
)
const sourceIds = new Set(ROSES_PACK.sources.map((s) => s.sourceId))
for (const q of official) {
  const d = decisions[q.questionId]
  if (!d) continue
  const verdict = officialVerdict(q, TODAY)

  for (const cite of d.citations) {
    if (!sourceIds.has(cite.sourceId)) {
      failures.push(`${q.questionId}: cita una font que no és al manifest (${cite.sourceId})`)
    } else if (!verifiedRefs.has(cite.sourceId)) {
      failures.push(`${q.questionId}: cita ${cite.sourceId}, que no té cap referència verificada`)
    }
  }
  if (d.status === 'supported-current' && d.citations.length === 0) {
    failures.push(`${q.questionId}: es declara vigent sense cap citació`)
  }
  if (d.status === 'pending-evidence' && !d.missing) {
    failures.push(`${q.questionId}: pendent sense dir què falta`)
  }
  if (d.status === 'official-key-conflicts-with-law-at-exam') {
    if (!d.lawAtExam) failures.push(`${q.questionId}: conflicte sense la redacció vigent el dia de l’examen`)
    if (!d.currentLawAnswer) failures.push(`${q.questionId}: conflicte sense dir què sosté la norma`)
    if (verdict.countsForMastery || verdict.canGenerateReview) {
      failures.push(`${q.questionId}: pregunta conflictiva que compta per al domini o pot generar repàs`)
    }
  }
}

if (failures.length > 0) {
  console.error('\n✗ La matriu no quadra i no s’escriu res:\n')
  for (const f of failures) console.error(`   · ${f}`)
  console.error()
  process.exit(1)
}

/* ─────────────────────────── Sortida ─────────────────────────── */

const rows = official
  .map((q) => {
    const d = decisions[q.questionId]!
    const exam = exams.get(q.officialExam!.examId)!
    const v = officialVerdict(q, TODAY)
    return {
      questionId: q.questionId,
      examId: exam.examId,
      heldOn: exam.heldOn,
      placeType: exam.placeType,
      section: q.officialExam!.testType,
      originalNumber: q.officialExam!.originalNumber,
      reserve: q.officialExam!.reserve,
      topicId: q.topicId,
      officialAnswer: q.officialExam!.officialAnswer,
      status: d.status as OfficialEvidenceStatus,
      usableForCurrentLearning: v.usableForCurrentLearning,
      countsForMastery: v.countsForMastery,
      canGenerateReview: v.canGenerateReview,
      notice: v.notice,
      currentLawAnswer: v.currentLawAnswer,
      lawAtExam: d.lawAtExam ?? null,
      lawToday: d.lawToday ?? null,
      changedOn: d.changedOn ?? null,
      why: d.why,
      citations: d.citations,
      missing: d.missing ?? null,
      explanationAvailable:
        d.status === 'supported-current' || d.status === 'partially-supported'
          ? 'disponible'
          : d.status === 'pending-evidence'
            ? 'bloquejada'
            : 'parcial',
    }
  })
  .sort((a, b) => a.examId.localeCompare(b.examId) || a.originalNumber - b.originalNumber)

mkdirSync(`${ROOT}artifacts`, { recursive: true })
writeFileSync(
  `${ROOT}artifacts/matriu-oficials.json`,
  `${JSON.stringify(
    {
      _note: [
        'Generat per scripts/report-official-matrix.ts; no s’edita a mà.',
        'Uneix el judici d’official-evidence-map.json amb les dades del banc.',
      ],
      generatedOn: TODAY,
      officialTextFingerprint: fingerprint,
      totals: count(rows.map((r) => r.status)),
      questions: rows,
    },
    null,
    2,
  )}\n`,
  'utf-8',
)

function count(values: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of values) out[v] = (out[v] ?? 0) + 1
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]))
}

const LABEL: Record<string, string> = {
  'supported-current': 'La plantilla quadra amb la norma i segueix bona avui',
  'supported-at-exam-now-superseded': 'Era bona el dia de l’examen; la norma ha canviat',
  'official-key-conflicts-with-law-at-exam': 'La plantilla no quadra amb la norma que ja regia aquell dia',
  'partially-supported': 'La font en sosté una part',
  'pending-evidence': 'Sense evidència suficient',
  'historical-current-affairs': 'Actualitat del dia de l’examen',
  'general-knowledge': 'Cultura general no jurídica',
  'out-of-syllabus': 'Fora dels 40 temes',
}

const md: string[] = []
const p = (line = ''): void => void md.push(line)
p('# Matriu de les 189 preguntes d’examen oficial')
p()
p(`**Generada** el ${TODAY} per \`scripts/report-official-matrix.ts\`. No s’edita a mà.`)
p()
p('La plantilla que va publicar el tribunal és un fet històric i no es toca. Aquesta')
p('matriu no la corregeix: la **situa**. Per a cada pregunta diu si el que va marcar el')
p('tribunal quadra amb la norma verificada, si va deixar de quadrar-hi, o si ja no hi')
p('quadrava el dia de l’examen —i, quan no hi ha manera de saber-ho, ho diu també.')
p()
p(`Empremta dels textos oficials (identificador, número, clau, enunciat i opcions): \`${fingerprint.slice(0, 32)}…\``)
p()

p('## Per estat probatori')
p()
p('| Estat | Preguntes | Vigent | Domini | Repàs |')
p('| --- | --- | --- | --- | --- |')
for (const [status, n] of Object.entries(count(rows.map((r) => r.status)))) {
  const sample = rows.find((r) => r.status === status)!
  p(
    `| \`${status}\` — ${LABEL[status]} | ${n} | ${sample.usableForCurrentLearning ? 'sí' : 'no'} | ` +
      `${sample.countsForMastery ? 'sí' : 'no'} | ${sample.canGenerateReview ? 'sí' : 'no'} |`,
  )
}
p()

const CRITICAL = ['official-key-conflicts-with-law-at-exam', 'supported-at-exam-now-superseded', 'pending-evidence']
for (const status of CRITICAL) {
  const group = rows.filter((r) => r.status === status)
  if (group.length === 0) continue
  p(`## ${LABEL[status]} — ${group.length}`)
  p()
  for (const r of group) {
    p(`### \`${r.questionId}\` · ${r.examId} · pregunta ${r.originalNumber} · ${r.heldOn}`)
    p()
    p(`- **Plantilla del tribunal:** ${r.officialAnswer})`)
    if (r.currentLawAnswer) {
      p(
        `- **Sosté la norma:** ${r.currentLawAnswer === 'cap' ? '**cap de les quatre opcions**' : `${r.currentLawAnswer})`}`,
      )
    }
    if (r.lawAtExam) p(`- **Redacció el dia de l’examen:** ${r.lawAtExam}`)
    if (r.lawToday) p(`- **Redacció avui:** ${r.lawToday}`)
    if (r.changedOn) p(`- **Canvi efectiu:** ${r.changedOn}`)
    if (r.missing) p(`- **Falta:** ${r.missing}`)
    p(`- **Per què:** ${r.why}`)
    for (const cite of r.citations) p(`- **\`${cite.sourceId}\` · ${cite.locator}:** «${cite.quote.slice(0, 400)}»`)
    p()
  }
}

p('## Per convocatòria')
p()
p('| Convocatòria | Data | Preguntes | Vigents | Fora de l’aprenentatge actual |')
p('| --- | --- | --- | --- | --- |')
for (const examId of [...new Set(rows.map((r) => r.examId))].sort()) {
  const group = rows.filter((r) => r.examId === examId)
  const usable = group.filter((r) => r.usableForCurrentLearning).length
  p(`| \`${examId}\` | ${group[0]!.heldOn} | ${group.length} | ${usable} | ${group.length - usable} |`)
}
p()

p('## Per tema')
p()
p('| Tema | Preguntes | Estats |')
p('| --- | --- | --- |')
for (const topicId of [...new Set(rows.map((r) => r.topicId))].sort()) {
  const group = rows.filter((r) => r.topicId === topicId)
  const states = Object.entries(count(group.map((r) => r.status)))
    .map(([s, n]) => `${n} ${s}`)
    .join(', ')
  p(`| \`${topicId}\` | ${group.length} | ${states} |`)
}
p()

p('## Per font citada')
p()
p('| Font | Preguntes que hi recolzen |')
p('| --- | --- |')
const bySource = count(rows.flatMap((r) => [...new Set(r.citations.map((c) => c.sourceId))]))
for (const [sourceId, n] of Object.entries(bySource)) p(`| \`${sourceId}\` | ${n} |`)
p()

p('## Les 189, una a una')
p()
p('| Pregunta | Convocatòria | Núm. | Tema | Clau | Estat | Vigent | Explicació |')
p('| --- | --- | --- | --- | --- | --- | --- | --- |')
for (const r of rows) {
  p(
    `| \`${r.questionId}\` | ${r.examId.replace('roses-', '')} | ${r.originalNumber} | ${r.topicId.replace('roses-', '')} | ` +
      `${r.officialAnswer} | \`${r.status}\` | ${r.usableForCurrentLearning ? '✓' : '—'} | ${r.explanationAvailable} |`,
  )
}
p()

writeFileSync(`${ROOT}artifacts/matriu-oficials.md`, `${md.join('\n')}\n`, 'utf-8')

console.log(`\n── Matriu de les 189 preguntes oficials ──\n`)
console.log(`  ${sealCheck}`)
for (const [status, n] of Object.entries(count(rows.map((r) => r.status)))) {
  console.log(`  ${String(n).padStart(4)}  ${status}`)
}
console.log(`\n  vigents per a l’aprenentatge actual: ${rows.filter((r) => r.usableForCurrentLearning).length}`)
console.log('\nEscrit artifacts/matriu-oficials.json')
console.log('Escrit artifacts/matriu-oficials.md\n')
