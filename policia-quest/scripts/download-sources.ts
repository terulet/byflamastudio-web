/**
 * Descàrrega de fonts oficials. `npm run sources:download`
 *
 * Baixa cada font del manifest a sources/cache/, en calcula el SHA-256 i
 * actualitza el manifest amb `fetchStatus`, `sha256` i `cacheFile`.
 *
 * Propietats importants:
 *  - **Mai trenca el build offline.** Si una descàrrega falla, la font es
 *    marca com a `pending-download` amb el motiu i l'script continua.
 *  - És idempotent: tornar-lo a executar només refresca el que calgui.
 *  - No inventa res: el que no es baixa, queda registrat com a pendent.
 *
 * Ús:
 *   npm run sources:download                # totes les fonts pendents
 *   npm run sources:download -- --all       # torna a baixar-ho tot
 *   npm run sources:download -- --id=ce-1978
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { SourceManifest, type Source } from '../content/schemas/index.ts'
import { allowedHostsFor } from './lib/official-hosts.ts'

const CACHE_DIR = 'sources/cache'
const MANIFEST_PATH = 'sources/source-manifest.json'
const TIMEOUT_MS = 45_000

const args = process.argv.slice(2)
const refetchAll = args.includes('--all')
const onlyId = args.find((a) => a.startsWith('--id='))?.slice('--id='.length)

const manifest = SourceManifest.parse(JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')))
mkdirSync(CACHE_DIR, { recursive: true })

function extensionFor(contentType: string | null): string {
  if (!contentType) return 'bin'
  if (contentType.includes('pdf')) return 'pdf'
  if (contentType.includes('html')) return 'html'
  if (contentType.includes('json')) return 'json'
  if (contentType.includes('xml')) return 'xml'
  return 'txt'
}

async function download(source: Source): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'policia-quest-content-factory/1.0' },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    // On hem acabat després de les redireccions. Si no és un amfitrió oficial
    // per a aquesta font, no es desa: val més una font pendent amb el motiu
    // escrit que una còpia d'origen desconegut amb un hash que la fa semblar
    // comprovada.
    const allowed = allowedHostsFor(source.url)
    const landed = new URL(response.url).hostname
    if (!allowed.includes(landed)) {
      throw new Error(
        `la redirecció acaba a ${landed}, que no és amfitrió oficial d’aquesta font ` +
          `(esperats: ${allowed.join(', ')}). Si ho és, afegiu-lo a OFFICIAL_REDIRECTS.`,
      )
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const ext = extensionFor(response.headers.get('content-type'))
    const file = `${source.sourceId}.${ext}`
    writeFileSync(join(CACHE_DIR, file), buffer)

    source.sha256 = createHash('sha256').update(buffer).digest('hex')
    source.cacheFile = file
    source.fetchStatus = 'downloaded'
    delete source.fetchNote
    console.log(`  ✓ ${source.sourceId} → ${file} (${(buffer.length / 1024).toFixed(0)} kB)`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    source.fetchStatus = 'pending-download'
    source.fetchNote = `No descarregada el ${new Date().toISOString().slice(0, 10)}: ${reason}`
    console.log(`  ✗ ${source.sourceId} — ${reason}`)
  } finally {
    clearTimeout(timer)
  }
}

const targets = manifest.sources.filter((s) => {
  if (onlyId) return s.sourceId === onlyId
  if (s.fetchStatus === 'not-required') return false
  if (refetchAll) return true
  if (s.fetchStatus !== 'downloaded') return true
  return !(s.cacheFile && existsSync(join(CACHE_DIR, s.cacheFile)))
})

console.log(`Descarregant ${targets.length} de ${manifest.sources.length} fonts…\n`)

// Seqüencial a propòsit: som convidats als servidors públics, no els martellegem.
for (const source of targets) {
  await download(source)
}

manifest.generatedAt = new Date().toISOString().slice(0, 10)
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')

const downloaded = manifest.sources.filter((s) => s.fetchStatus === 'downloaded').length
const pending = manifest.sources.filter((s) => s.fetchStatus === 'pending-download').length
console.log(`\nManifest actualitzat: ${downloaded} descarregades, ${pending} pendents.`)
if (pending > 0) {
  console.log('Les fonts pendents queden registrades amb el motiu exacte. El build no es trenca.')
}
