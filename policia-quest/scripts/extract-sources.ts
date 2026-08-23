/**
 * Extracció de text normalitzat. `npm run sources:extract`
 *
 * Converteix les còpies de sources/cache/ en text pla dins sources/extracted/
 * perquè es puguin cercar cites i contrastar referències.
 *
 * L'HTML es converteix amb un despullat conservador d'etiquetes. El PDF
 * necessita una eina externa (`pdftotext`, del paquet poppler-utils); si no
 * hi és, l'script ho diu i continua amb la resta en comptes de fallar.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, parse } from 'node:path'

const CACHE_DIR = 'sources/cache'
const OUT_DIR = 'sources/extracted'

mkdirSync(OUT_DIR, { recursive: true })

function hasPdfToText(): boolean {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

let files: string[]
try {
  files = readdirSync(CACHE_DIR)
} catch {
  console.log('No hi ha res a sources/cache/. Executeu primer `npm run sources:download`.')
  process.exit(0)
}

if (files.length === 0) {
  console.log('sources/cache/ és buit. Executeu primer `npm run sources:download`.')
  process.exit(0)
}

const pdfToTextAvailable = hasPdfToText()
let done = 0
let skipped = 0

for (const file of files) {
  const { name, ext } = parse(file)
  const input = join(CACHE_DIR, file)
  const output = join(OUT_DIR, `${name}.txt`)

  if (ext === '.pdf') {
    if (!pdfToTextAvailable) {
      console.log(`  · ${file} — omès: cal pdftotext (paquet poppler-utils)`)
      skipped++
      continue
    }
    execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', input, output])
    console.log(`  ✓ ${file}`)
    done++
    continue
  }

  if (ext === '.html' || ext === '.txt' || ext === '.xml') {
    writeFileSync(output, stripHtml(readFileSync(input, 'utf8')))
    console.log(`  ✓ ${file}`)
    done++
    continue
  }

  console.log(`  · ${file} — omès: format no suportat`)
  skipped++
}

console.log(`\n${done} fonts extretes, ${skipped} omeses.`)
if (!pdfToTextAvailable) {
  console.log('Instal·leu poppler-utils per extreure els PDF (bases i quadernets d’examen).')
}
