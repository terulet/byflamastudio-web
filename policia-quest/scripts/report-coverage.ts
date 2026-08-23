/**
 * Informe de cobertura. `npm run content:report`
 *
 * Diu, sense maquillatge, què cobreix el contingut i què li falta. Escriu
 * artifacts/coverage-report.md i el mostra per consola.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { ROSES_PACK } from '../content/municipalities/roses/index.ts'

const lines: string[] = []
const out = (text = ''): void => {
  lines.push(text)
}

const { syllabus, questions, lessons, exams, sources, currentAffairs, blueprints } = ROSES_PACK
const active = questions.filter((q) => q.status === 'active')
const today = new Date().toISOString().slice(0, 10)

out('# Informe de cobertura — Policia Quest · Roses')
out()
out(`Generat el ${today} · versió de contingut ${ROSES_PACK.version.packVersion}`)
out()

/* ---------------- Resum ---------------- */

out('## Resum')
out()
out('| Mètrica | Valor |')
out('| --- | --- |')
out(`| Temes del temari | ${syllabus.topics.length} |`)
out(`| Microlliçons | ${lessons.length} |`)
out(`| Preguntes totals | ${questions.length} |`)
out(`| Preguntes actives | ${active.length} |`)
out(`| — de coneixements professionals | ${active.filter((q) => q.track === 'coneixements-professionals').length} |`)
out(`| — de cultura general | ${active.filter((q) => q.track === 'cultura-general').length} |`)
out(`| Preguntes d’examen oficial importades | ${questions.filter((q) => q.origin === 'official').length} |`)
out(`| Fonts registrades | ${sources.length} |`)
out(`| Exàmens registrats | ${exams.length} |`)
out()

/* ---------------- Cobertura per tema ---------------- */

out('## Cobertura per tema')
out()
out('| # | Tema | Bloc | Lliçó | Preguntes actives | Fonts |')
out('| --- | --- | --- | --- | --- | --- |')

const lessonTopics = new Set(lessons.map((l) => l.topicId))
const activeByTopic = new Map<string, number>()
for (const q of active) activeByTopic.set(q.topicId, (activeByTopic.get(q.topicId) ?? 0) + 1)

const thinTopics: string[] = []
for (const topic of [...syllabus.topics].sort((a, b) => a.number - b.number)) {
  const n = activeByTopic.get(topic.topicId) ?? 0
  // L'objectiu de disseny és 5 preguntes pròpies per tema; per sota, es reporta.
  if (n < 5) thinTopics.push(`tema ${topic.number} (${n} preguntes)`)
  out(
    `| ${topic.number} | ${topic.title.ca} | ${topic.block} | ${lessonTopics.has(topic.topicId) ? '✓' : '✗'} | ${n} | ${topic.primarySourceIds.length} |`,
  )
}
out()

/* ---------------- Estat de les fonts ---------------- */

out('## Estat de les fonts')
out()
const downloaded = sources.filter((s) => s.fetchStatus === 'downloaded')
const pendingSources = sources.filter((s) => s.fetchStatus === 'pending-download')
out(`- Descarregades i verificades per SHA-256: **${downloaded.length}**`)
out(`- Pendents de descàrrega: **${pendingSources.length}**`)
out()

if (pendingSources.length > 0) {
  out('### Fonts pendents')
  out()
  out('| Font | Àmbit | URL |')
  out('| --- | --- | --- |')
  for (const s of pendingSources) {
    out(`| \`${s.sourceId}\` | ${s.scope} | ${s.url} |`)
  }
  out()
  const reason = pendingSources[0]?.fetchNote
  if (reason) {
    out(`> Motiu registrat: ${reason}`)
    out()
  }
}

/* ---------------- Estat de revisió de les referències ---------------- */

out('## Estat de verificació de les referències')
out()
const refStates = new Map<string, number>()
for (const q of questions) {
  for (const r of q.references) refStates.set(r.reviewStatus, (refStates.get(r.reviewStatus) ?? 0) + 1)
}
for (const l of lessons) {
  for (const r of l.references) refStates.set(r.reviewStatus, (refStates.get(r.reviewStatus) ?? 0) + 1)
}
out('| Estat | Referències |')
out('| --- | --- |')
for (const [state, n] of [...refStates].sort()) out(`| ${state} | ${n} |`)
out()
out(
  '`pending-source-verification` vol dir que la referència apunta a una norma real i concreta, ' +
  'però que encara no s’ha contrastat automàticament contra la còpia local del text consolidat. ' +
  'Passarà a `verified` quan `npm run sources:download` i la validació s’executin amb accés a la xarxa.',
)
out()

/* ---------------- Exàmens oficials ---------------- */

out('## Exàmens oficials')
out()
out('| Examen | Prioritat | Estat | Preguntes | Font |')
out('| --- | --- | --- | --- | --- |')
for (const e of [...exams].sort((a, b) => a.priority.localeCompare(b.priority) || b.year - a.year)) {
  out(
    `| ${e.examId} | ${e.priority} | ${e.importStatus} | ${e.questionIds.length}${e.expectedQuestionCount ? ` / ${e.expectedQuestionCount}` : ''} | \`${e.sourceId}\` |`,
  )
}
out()

const p0Pending = exams.filter((e) => e.priority === 'P0' && e.importStatus !== 'imported')
if (p0Pending.length > 0) {
  out(`> **${p0Pending.length} dels 4 exàmens P0 no s’han pogut importar.** El seu contingut no s’inventa: `)
  out('> el registre conserva la URL oficial i el nombre de preguntes esperat perquè la importació es')
  out('> pugui completar en una execució amb accés a la xarxa.')
  out()
}

/* ---------------- Actualitat ---------------- */

out('## Actualitat')
out()
for (const pack of currentAffairs) {
  out(`- \`${pack.packId}\` · ${pack.status} · cobreix ${pack.coversFrom} → ${pack.coversTo} · caduca ${pack.expiresAt} · **${pack.questionIds.length} preguntes**`)
  if (pack.note) out(`  - ${pack.note}`)
}
out()

/* ---------------- Simulacres ---------------- */

out('## Capacitat dels simulacres')
out()
out('| Simulacre | Preguntes requerides (amb reserva) | Disponibles al banc | Estat |')
out('| --- | --- | --- | --- |')
for (const bp of blueprints) {
  const available = active.filter((q) => q.track === bp.track).length
  const needed = bp.questionCount + bp.reserveCount
  const ok = available >= needed
  const enoughBody = available >= bp.questionCount
  const verdict = ok
    ? '✓ es pot muntar'
    : enoughBody
      ? '⚠ sense reserva'
      : '✗ banc insuficient'
  out(`| ${bp.title.ca} | ${needed} | ${available} | ${verdict} |`)
}
out()

/* ---------------- Què necessita revisió humana ---------------- */

out('## Què necessita revisió humana')
out()
const todo: string[] = []

if (pendingSources.length > 0) {
  todo.push(
    `Descarregar les ${pendingSources.length} fonts pendents i tornar a validar el contingut per passar ` +
    'les referències a `verified`.',
  )
}
if (p0Pending.length > 0) {
  todo.push(
    `Importar els ${p0Pending.length} exàmens oficials de prioritat P0 (2025 en propietat i 2026 interins, ` +
    'cultura general i coneixements professionals), amb les respostes publicades pel tribunal.',
  )
}
const p1Pending = exams.filter((e) => e.priority === 'P1' && e.importStatus !== 'imported')
if (p1Pending.length > 0) {
  todo.push(
    `Localitzar la URL directa dels ${p1Pending.length} quadernets de prioritat P1 a l’arxiu municipal i importar-los.`,
  )
}
const emptyPacks = currentAffairs.filter((p) => p.status === 'active' && p.questionIds.length === 0)
if (emptyPacks.length > 0) {
  todo.push(
    'Omplir el paquet d’actualitat amb fets verificats contra fonts oficials o periodístiques fiables. ' +
    'La prova de cultura general reserva 10 de 20 preguntes a l’actualitat i ara mateix el banc no en té cap.',
  )
}
const ordinanceRefs = questions.filter((q) =>
  q.references.some((r) => r.sourceId.startsWith('roses-ordenanca')),
).length
todo.push(
  `Contrastar contra el text vigent les ${ordinanceRefs} preguntes que citen les ordenances municipals de ` +
  'Roses (temes 35 i 36). Ara es basen en el marc legal general perquè les ordenances no eren accessibles.',
)
if (thinTopics.length > 0) {
  todo.push(`Ampliar el banc als temes per sota de l'objectiu de 5 preguntes: ${thinTopics.join(', ')}.`)
}

for (const [i, item] of todo.entries()) out(`${i + 1}. ${item}`)
out()

/* ---------------- SOURCES.md, generat del manifest ---------------- */

const sourceLines: string[] = []
sourceLines.push('# Fonts — Policia Quest · Roses')
sourceLines.push('')
sourceLines.push('> **Fitxer generat.** No l’editeu a mà: surt de `sources/source-manifest.json`')
sourceLines.push('> mitjançant `npm run content:report`. Per afegir o corregir una font, editeu el')
sourceLines.push('> manifest.')
sourceLines.push('')
sourceLines.push(`Generat el ${today} · ${sources.length} fonts registrades.`)
sourceLines.push('')

const SCOPE_TITLES: Record<string, string> = {
  roses: 'Roses',
  catalunya: 'Catalunya',
  estatal: 'Estat',
  ue: 'Unió Europea',
  internacional: 'Internacional',
}

for (const scope of ['roses', 'catalunya', 'estatal', 'ue', 'internacional']) {
  const group = sources.filter((s) => s.scope === scope)
  if (group.length === 0) continue
  sourceLines.push(`## ${SCOPE_TITLES[scope] ?? scope}`)
  sourceLines.push('')
  for (const s of group) {
    sourceLines.push(`### \`${s.sourceId}\``)
    sourceLines.push('')
    sourceLines.push(`- **Títol**: ${s.title}`)
    sourceLines.push(`- **Organisme**: ${s.issuer}`)
    sourceLines.push(`- **Tipus**: ${s.kind}`)
    sourceLines.push(`- **URL**: ${s.url}`)
    if (s.publishedAt) sourceLines.push(`- **Publicació**: ${s.publishedAt}`)
    sourceLines.push(`- **Consulta**: ${s.consultedAt}`)
    sourceLines.push(`- **Vigència**: ${s.status}`)
    sourceLines.push(`- **Còpia local**: ${s.fetchStatus}${s.sha256 ? ` (SHA-256 \`${s.sha256}\`)` : ''}`)
    if (s.fetchNote) sourceLines.push(`- **Nota de descàrrega**: ${s.fetchNote}`)
    if (s.notes) sourceLines.push(`- **Notes**: ${s.notes}`)
    sourceLines.push('')
  }
}

writeFileSync('SOURCES.md', sourceLines.join('\n'))

/* ---------------- Escriptura ---------------- */

mkdirSync('artifacts', { recursive: true })
const report = lines.join('\n')
writeFileSync('artifacts/coverage-report.md', report + '\n')
console.log(report)
console.error('\n→ Escrit a artifacts/coverage-report.md i SOURCES.md')
