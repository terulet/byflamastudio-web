/**
 * Adopció de fonts entregades a mà. `npm run sources:adopt`
 *
 * `sources:download` necessita xarxa. Aquest script no: agafa els fitxers que
 * algú hagi deixat a `sources/inbox/`, els comprova, els mou a
 * `sources/cache/` i actualitza el manifest exactament igual que si s'haguessin
 * baixat. És el camí previst quan qui prepara el contingut té accés a les fonts
 * oficials i l'entorn de construcció no.
 *
 * Ús:
 *   npm run sources:adopt -- --list     # què falta i on trobar-ho
 *   npm run sources:adopt -- --dry-run  # què faria, sense tocar res
 *   npm run sources:adopt               # adopta el que hi hagi a l'inbox
 *
 * Com anomenar els fitxers
 * ────────────────────────
 * El nom del fitxer, sense extensió, ha de ser el `sourceId` del manifest:
 *
 *   sources/inbox/roses-bases-2026-interins.pdf
 *   sources/inbox/roses-ordenanca-circulacio.pdf
 *   sources/inbox/roses-examen-2026-interins-cg.pdf
 *
 * `--list` imprimeix la llista exacta d'identificadors pendents amb la seva URL
 * oficial, que és la comanda per començar. Un fitxer amb un nom que no
 * correspon a cap font es reporta i **no** s'adopta: endevinar a quina font
 * pertany un PDF seria exactament el tipus de suposició que aquest projecte no
 * fa.
 *
 * Què NO fa
 * ─────────
 * No llegeix el contingut ni en dedueix res. Adoptar una font vol dir que ja
 * n'hi ha una còpia local verificable pel seu SHA-256; contrastar les cites és
 * feina de `sources:extract` i de la revisió humana, i passar una referència a
 * `verified` segueix sent una decisió de qui la comprova.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { extname, join, parse } from 'node:path'
import { SourceManifest, type Source } from '../content/schemas/index.ts'

const INBOX_DIR = 'sources/inbox'
const CACHE_DIR = 'sources/cache'
const MANIFEST_PATH = 'sources/source-manifest.json'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const listOnly = args.includes('--list')

const manifest = SourceManifest.parse(JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')))
const byId = new Map(manifest.sources.map((s) => [s.sourceId, s]))
const today = new Date().toISOString().slice(0, 10)

/** Prioritat de rescat: primer el que bloqueja contingut, després la resta. */
const P0_PREFIXES = ['roses-bases', 'roses-examen', 'roses-ordenanca']
function priority(source: Source): number {
  return P0_PREFIXES.some((p) => source.sourceId.startsWith(p)) ? 0 : 1
}

function pending(): Source[] {
  return manifest.sources
    .filter((s) => s.fetchStatus === 'pending-download')
    .sort((a, b) => priority(a) - priority(b) || a.sourceId.localeCompare(b.sourceId))
}

if (listOnly) {
  const list = pending()
  console.log(`\n── Fonts pendents de còpia local (${list.length}) ──\n`)
  console.log('Deseu cada fitxer a sources/inbox/ amb el nom de l’identificador,')
  console.log('per exemple sources/inbox/roses-bases-2026-interins.pdf\n')
  let lastPriority = -1
  for (const source of list) {
    const p = priority(source)
    if (p !== lastPriority) {
      console.log(p === 0 ? '── Prioritat: desbloqueja contingut ──' : '\n── Resta ──')
      lastPriority = p
    }
    console.log(`  ${source.sourceId}`)
    console.log(`      ${source.title}`)
    console.log(`      ${source.url}`)
  }
  console.log()
  process.exit(0)
}

mkdirSync(INBOX_DIR, { recursive: true })
mkdirSync(CACHE_DIR, { recursive: true })

const files = readdirSync(INBOX_DIR).filter((name) => !name.startsWith('.'))
if (files.length === 0) {
  console.log(`\nNo hi ha cap fitxer a ${INBOX_DIR}/.`)
  console.log('Executeu `npm run sources:adopt -- --list` per veure què falta.\n')
  process.exit(0)
}

const adopted: string[] = []
const unmatched: string[] = []
const problems: string[] = []

for (const name of files) {
  const path = join(INBOX_DIR, name)
  const stats = statSync(path)
  if (stats.isDirectory()) continue

  const sourceId = parse(name).name
  const source = byId.get(sourceId)
  if (!source) {
    unmatched.push(name)
    continue
  }

  if (stats.size === 0) {
    problems.push(`${name}: el fitxer és buit`)
    continue
  }

  const bytes = readFileSync(path)
  const sha256 = createHash('sha256').update(bytes).digest('hex')

  // Un PDF que en realitat és una pàgina d'error és el parany clàssic quan algú
  // baixa des d'un portal amb sessió. Es detecta pel començament del fitxer.
  const head = bytes.subarray(0, 512).toString('latin1').toLowerCase()
  const ext = extname(name).toLowerCase()
  if (ext === '.pdf' && !head.startsWith('%pdf')) {
    problems.push(`${name}: té extensió .pdf però no comença per %PDF (potser és una pàgina d’error)`)
    continue
  }
  if (head.includes('<title>404') || head.includes('access denied')) {
    problems.push(`${name}: sembla una pàgina d’error, no el document`)
    continue
  }

  if (source.sha256 === sha256 && source.fetchStatus === 'downloaded') {
    adopted.push(`${sourceId} (ja hi era, sense canvis)`)
    continue
  }

  const cacheFile = `${sourceId}${ext || '.bin'}`
  if (!dryRun) {
    copyFileSync(path, join(CACHE_DIR, cacheFile))
    source.fetchStatus = 'downloaded'
    source.sha256 = sha256
    source.cacheFile = cacheFile
    source.consultedAt = today
    delete source.fetchNote
  }
  adopted.push(`${sourceId} → ${cacheFile} (${(stats.size / 1024).toFixed(0)} kB, sha ${sha256.slice(0, 12)}…)`)
}

if (!dryRun && adopted.length > 0) {
  manifest.generatedAt = today
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

console.log(`\n── Adopció de fonts locals${dryRun ? ' (assaig)' : ''} ──\n`)

if (adopted.length > 0) {
  console.log(`Adoptades (${adopted.length}):`)
  for (const line of adopted) console.log(`  ✓ ${line}`)
  console.log()
}

if (problems.length > 0) {
  console.log(`Rebutjades (${problems.length}):`)
  for (const line of problems) console.log(`  ✗ ${line}`)
  console.log()
}

if (unmatched.length > 0) {
  console.log(`Sense correspondència al manifest (${unmatched.length}):`)
  for (const name of unmatched) console.log(`  ? ${name}`)
  console.log('  El nom del fitxer, sense extensió, ha de ser un sourceId del manifest.')
  console.log('  Vegeu `npm run sources:adopt -- --list`.\n')
}

const stillPending = pending().length
console.log(`Queden ${stillPending} fonts pendents de ${manifest.sources.length}.`)
if (adopted.length > 0 && !dryRun) {
  console.log('\nSegüent pas:')
  console.log('  npm run sources:extract     # converteix les còpies en text cercable')
  console.log('  npm run content:validate    # contrasta el que ja es pugui contrastar')
  console.log('  npm run exams:import        # esborranys de transcripció dels quadernets')
}
console.log()

if (problems.length > 0) process.exit(1)
