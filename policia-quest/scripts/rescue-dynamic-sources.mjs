/**
 * Rescat de les dues fonts que la descàrrega del 2026-08-24 no va portar.
 *
 * `www.roses.cat` i `ciberseguretat.gencat.cat` carreguen el cos de les pàgines
 * per JavaScript. `sources:download` fa una petició HTTP i desa el que torna:
 * l'esquelet de navegació, 6 i 8 kB de menús. El SHA-256 quadra i el fitxer no
 * conté res. Vint-i-una referències del banc en depenen i segueixen pendents.
 *
 * Això no es pot arreglar des de l'entorn de construcció, que no arriba a cap
 * font. Aquest script s'executa **a la màquina de qui té xarxa**, deixa un
 * paquet segellat, i l'adopció es fa aquí, oberta i verificable, com els tres
 * paquets anteriors.
 *
 * ─── Com fer-lo servir ───────────────────────────────────────────────────
 *
 *   npm install
 *   npx playwright install chromium      # només la primera vegada
 *   node scripts/rescue-dynamic-sources.mjs
 *
 * I sense xarxa, per comprovar que el filtre de pàgines buides funciona:
 *
 *   node scripts/rescue-dynamic-sources.mjs --self-check
 *
 * Deixa `rescat-fonts-dinamiques/` al costat del projecte amb el text de cada
 * pàgina, `index.json` i `SHA256SUMS.txt`. Comprimiu la carpeta i porteu-la.
 *
 * ─── Què fa i què no ─────────────────────────────────────────────────────
 *
 * No inventa cap adreça. Surt de les dues úniques URL que ja consten al
 * manifest —les portades, que existeixen de debò— i navega només dins del
 * mateix amfitrió, seguint els enllaços que la pàgina ja porta. Si una secció
 * ha canviat de lloc, la trobarà o no la portarà; el que no farà mai és desar
 * un 404 amb bona cara.
 *
 * Rebutja les pàgines de només menú, que és exactament l'error que va deixar
 * les dues fonts buides. Una pàgina només entra al paquet si, després de
 * renderitzar-la i treure'n capçalera, navegació i peu, li queda text propi per
 * damunt del llindar **i** hi apareix algun dels termes que les referències
 * pendents necessiten. Cap dels dos criteris sol n'hi ha prou: hi ha menús molt
 * llargs i hi ha portades que anomenen la Ciutadella en un enllaç.
 *
 * De cada pàgina desa el text, la mida útil, l'adreça final després de
 * redireccions, el mètode («navegador renderitzat»), el moment de la captura i
 * el SHA-256. Sense aquestes cinc coses una instantània no és evidència de res:
 * és un fitxer de text que algú diu que va treure d'algun lloc.
 *
 * ─── El que continua bloquejat ───────────────────────────────────────────
 *
 * Portar el paquet no verifica res per si sol. Les 21 referències i les dues
 * preguntes oficials de ciberseguretat segueixen pendents fins que algú obri
 * cada instantània i hi busqui la proposició concreta, una a una, com es va fer
 * amb les 313 del paquet normatiu. Aquest script porta el document; el
 * veredicte el signa qui llegeix.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

/*
 * Chromium de l'entorn de construcció, si hi és.
 *
 * Aquest script està pensat per córrer a la màquina de qui té xarxa, on
 * `npx playwright install chromium` deixa el navegador on toca i aquesta línia
 * no fa res. Aquí dins hi ha una còpia en una ruta pròpia, i cal poder-hi
 * passar la comprovació sense xarxa.
 */
const LOCAL_CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const launchOptions = existsSync(LOCAL_CHROME) ? { executablePath: LOCAL_CHROME } : {}

/** Carpeta de sortida, germana del projecte. */
// `fileURLToPath` i no `.pathname`: a Windows aquell camp dona «/C:/…».
const OUT = fileURLToPath(new URL('../../rescat-fonts-dinamiques/', import.meta.url))

/**
 * Les dues fonts, amb l'única adreça que ja consta al manifest i els termes
 * que les referències pendents necessiten trobar.
 *
 * Els termes surten dels localitzadors de
 * `adopcio-normativa-2026-08-24.json`, i són **específics a propòsit**. La
 * primera versió d'aquesta llista hi barrejava paraules com «funcions»,
 * «incident» o «turisme», i la comprovació sense xarxa va ensenyar per què no
 * val: l'esquelet de ciberseguretat.gencat.cat les porta totes tres als
 * reclams del menú i passava el filtre. Un menú anomena un tema; un document
 * el desenvolupa. Només hi entren termes que no es poden dir de passada.
 */
const TARGETS = [
  {
    sourceId: 'roses-web-municipi',
    start: 'https://www.roses.cat/',
    // 15 referències pendents: situació, entorn, patrimoni, nuclis, economia.
    terms: [
      'ciutadella', 'castell de la trinitat', 'rhode', 'cap de creus',
      'dolmen', 'megalític', 'creu d’en cobertella', 'santa margarida',
      'canyelles', 'almadrava', 'alt empordà', 'badia de roses',
      'urbanitzacions',
    ],
    maxPages: 60,
  },
  {
    sourceId: 'agencia-ciberseguretat-catalunya',
    start: 'https://ciberseguretat.gencat.cat/',
    // 6 referències pendents: funcions, amenaces, autoprotecció, proves.
    terms: [
      'autoprotecció', 'ciberamenaça', 'ciberamenaces', 'ciberincident',
      'phishing', 'ransomware', 'suplantació d’identitat', 'proves digitals',
      'enginyeria social', 'doble factor',
    ],
    maxPages: 40,
  },
]

/**
 * Prosa mínima, en caràcters, i paràgrafs llargs mínims.
 *
 * «Prosa» vol dir el text que **no** és dins d'un enllaç. És la diferència
 * entre un menú i un document, i és el que la mida del fitxer no veu: la
 * portada de www.roses.cat té 55.000 caràcters de text visible i 119 de prosa.
 */
const MIN_PROSE = 1200
const MIN_PARAGRAPHS = 2
/** Termes específics mínims que ha de portar la prosa d'una pàgina. */
const MIN_TERMS = 2
/** Un paràgraf de debò: una frase llarga, no un reclam de tres paraules. */
const PARAGRAPH_CHARS = 150

/**
 * El text d'una pàgina, separat en dues coses que no són el mateix.
 *
 * `text` és el que es desarà: el contingut visible sense capçalera, navegació
 * ni peu. `prose` és el que decideix si val la pena desar-lo: el mateix, però
 * a més sense el text dels enllaços.
 *
 * Aquesta segona mesura és la que faltava el 24 d'agost. Aleshores es mirava
 * la mida del fitxer, i un menú prou llarg passa qualsevol llindar de mida.
 */
async function extract(page, chars) {
  return page.evaluate((paragraphChars) => {
    const clone = document.body.cloneNode(true)
    for (const sel of ['header', 'nav', 'footer', 'script', 'style', 'noscript', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', '.menu', '.navbar', '.cookie', '#cookies']) {
      for (const node of clone.querySelectorAll(sel)) node.remove()
    }
    const main = clone.querySelector('main, [role="main"], article, #content, .content') ?? clone
    const text = (main.innerText ?? main.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()

    const bare = main.cloneNode(true)
    for (const a of bare.querySelectorAll('a')) a.remove()
    const prose = (bare.innerText ?? bare.textContent ?? '').replace(/\s+/g, ' ').trim()
    const paragraphs = prose.split(/(?<=[.!?])\s+/).filter((s) => s.length >= paragraphChars).length
    return { text, prose, paragraphs }
  }, chars)
}

/** Per què una pàgina no entra al paquet, o `null` si hi entra. */
function reject({ text, prose, paragraphs }, terms) {
  if (prose.length < MIN_PROSE) {
    return `prosa insuficient (${prose.length} car. fora d’enllaços de ${text.length} visibles): esquelet de navegació`
  }
  if (paragraphs < MIN_PARAGRAPHS) {
    return `sense paràgrafs (${paragraphs}): reclams i titulars, no text seguit`
  }
  if (terms.length < MIN_TERMS) {
    return `la prosa no parla del que les referències pendents necessiten (${terms.length} terme/s)`
  }
  return null
}

function slug(url) {
  return url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80).toLowerCase()
}

async function rescue(browser, target) {
  const context = await browser.newContext({ locale: 'ca-ES' })
  const page = await context.newPage()
  const host = new URL(target.start).host
  const queue = [target.start]
  const seen = new Set()
  const kept = []
  const rejected = []

  while (queue.length > 0 && seen.size < target.maxPages) {
    const url = queue.shift()
    if (seen.has(url)) continue
    seen.add(url)

    let response
    try {
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    } catch {
      rejected.push({ url, why: 'no s’ha pogut carregar' })
      continue
    }
    const status = response?.status() ?? 0
    if (status >= 400) {
      rejected.push({ url, status, why: `resposta ${status}` })
      continue
    }

    const extracted = await extract(page, PARAGRAPH_CHARS)
    // Els termes es busquen a la prosa, no al text sencer: si només surten
    // dins d'enllaços, la pàgina anomena el tema però no el tracta.
    const hits = target.terms.filter((t) => extracted.prose.toLowerCase().includes(t))

    // Els enllaços es recullen sempre, també de les pàgines que no serveixen:
    // la portada és justament el menú que porta a les que sí.
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.href),
    )
    for (const href of links) {
      try {
        const u = new URL(href)
        u.hash = ''
        if (u.host === host && !seen.has(u.href) && !/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx|xls|xlsx)$/i.test(u.pathname)) {
          queue.push(u.href)
        }
      } catch { /* href no navegable */ }
    }

    const why = reject(extracted, hits)
    if (why !== null) {
      rejected.push({ url, usefulChars: extracted.text.length, proseChars: extracted.prose.length, terms: hits.length, why })
      continue
    }

    const text = extracted.text
    const finalUrl = page.url()
    const body = `# ${await page.title()}\n# ${finalUrl}\n# capturat: ${new Date().toISOString()}\n# mètode: navegador renderitzat (Chromium, networkidle)\n\n${text}\n`
    const file = `${target.sourceId}--${slug(finalUrl)}.txt`
    writeFileSync(join(OUT, file), body, 'utf8')
    kept.push({
      sourceId: target.sourceId,
      requestedUrl: url,
      finalUrl,
      file,
      method: 'navegador renderitzat (Chromium, networkidle)',
      capturedAt: new Date().toISOString(),
      usefulChars: text.length,
      proseChars: extracted.prose.length,
      paragraphs: extracted.paragraphs,
      termsFound: hits,
      bytes: Buffer.byteLength(body),
      sha256: createHash('sha256').update(body).digest('hex'),
    })
    console.log(`  ✓ ${finalUrl}  (${extracted.prose.length} car. de prosa, ${extracted.paragraphs} paràgrafs, ${hits.length} termes)`)
  }

  await context.close()
  return { kept, rejected, visited: seen.size }
}

/*
 * Comprovació pròpia, sense xarxa: `node scripts/rescue-dynamic-sources.mjs --self-check`.
 *
 * Les dues còpies que van enganyar el baixador són a `sources/cache/`. Un
 * rebutjador que no les rebutgi no serveix de res, i és l'única part d'aquest
 * script que es pot provar des d'aquí. Obre els dos fitxers amb `file://` i
 * exigeix que tots dos caiguin.
 */
if (process.argv.includes('--self-check')) {
  const CACHE = new URL('../sources/cache/', import.meta.url)
  const browser = await chromium.launch(launchOptions)
  const page = await browser.newPage()
  let bad = 0
  for (const target of TARGETS) {
    const file = new URL(`${target.sourceId}.html`, CACHE)
    if (!existsSync(fileURLToPath(file))) {
      console.log(`  – ${target.sourceId}: sense còpia local, res a comprovar`)
      continue
    }
    await page.goto(file.href, { waitUntil: 'load' })
    const extracted = await extract(page, PARAGRAPH_CHARS)
    const hits = target.terms.filter((t) => extracted.prose.toLowerCase().includes(t))
    const why = reject(extracted, hits)
    console.log(`  ${why ? '✓ rebutjada' : '✗ ACCEPTADA'}  ${target.sourceId}: ${why ?? 'passa el filtre'}`)
    if (why === null) bad++
  }
  await browser.close()
  if (bad > 0) {
    console.error(`\n${bad} còpia(es) buida(es) han passat el filtre. El rebutjador no serveix.`)
    process.exit(1)
  }
  console.log('\nLes dues còpies que van enganyar el baixador no passen aquest filtre.')
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(launchOptions)
const index = { generatedAt: new Date().toISOString(), targets: [] }

for (const target of TARGETS) {
  console.log(`\n── ${target.sourceId} ──`)
  const result = await rescue(browser, target)
  console.log(`  ${result.kept.length} pàgines útils de ${result.visited} visitades`)
  // Els termes que cap pàgina ha portat es diuen: són els pendents que
  // aquest paquet **no** desbloqueja, i val més saber-ho abans de portar-lo.
  const covered = new Set(result.kept.flatMap((k) => k.termsFound))
  const missing = target.terms.filter((t) => !covered.has(t))
  if (missing.length > 0) console.log(`  sense cap pàgina que en parli: ${missing.join(', ')}`)
  index.targets.push({
    sourceId: target.sourceId,
    start: target.start,
    visited: result.visited,
    pages: result.kept,
    rejected: result.rejected,
    termsNotFound: missing,
  })
}

await browser.close()

writeFileSync(join(OUT, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')
const sums = index.targets
  .flatMap((t) => t.pages)
  .map((p) => `${p.sha256}  ${p.file}`)
  .join('\n')
writeFileSync(join(OUT, 'SHA256SUMS.txt'), `${sums}\n`, 'utf8')

const total = index.targets.reduce((n, t) => n + t.pages.length, 0)
console.log(`\nEscrit ${OUT}`)
console.log(`${total} instantànies, index.json i SHA256SUMS.txt.`)
console.log('Comprimiu la carpeta i porteu-la. Les 21 referències i les dues')
console.log('preguntes de ciberseguretat segueixen pendents fins que algú obri')
console.log('cada instantània i hi busqui la proposició concreta.')
