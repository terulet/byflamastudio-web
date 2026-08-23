/**
 * Auditoria visual de les preguntes d'actualitat, dins de l'app de debò.
 *
 * Llegir el fitxer de contingut no és mirar-se-les: el que arriba a qui estudia
 * passa pel motor de selecció i pels components. Ja va passar una vegada que
 * una contaminació d'extracció es veiés només obrint l'app, i no a la revisió
 * del fitxer.
 *
 * Això obre simulacres de cultura general seguits —cada un porta 10 preguntes
 * d'actualitat, triades amb una llavor diferent— fins a haver vist les que hi
 * ha al paquet. De cada una en desa la captura i, al final, en fa fulls de
 * contacte per poder-les repassar totes.
 *
 *     node scripts/audit-actualitat.mjs
 */
import { chromium } from '@playwright/test'
import { mkdirSync, existsSync, readFileSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const OUT = 'artifacts/actualitat'
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const MAX_ROUNDS = 25

const expected = JSON.parse(
  readFileSync('content/municipalities/roses/current-affairs/adoption-2026-08.json', 'utf-8'),
).questions.map((q) => q.questionId)

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  ...(existsSync(CHROME) ? { executablePath: CHROME } : {}),
})
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 1,
  locale: 'ca-ES',
})
const page = await context.newPage()

const problems = []
page.on('console', (msg) => {
  if (msg.type() === 'error') problems.push(`consola: ${msg.text()}`)
})
page.on('pageerror', (error) => problems.push(`excepció: ${error.message}`))

await page.goto(BASE)
await page.evaluate(() => {
  localStorage.setItem(
    'pq.settings',
    JSON.stringify({
      explanationLang: 'ca',
      theme: 'dark',
      dailyGoal: 10,
      examDate: null,
      sound: false,
      haptics: false,
      reducedMotion: true,
      municipality: 'roses',
      onboarded: true,
    }),
  )
})
await page.reload()
await page.waitForSelector('[data-testid="home"]')

const seen = new Map()
for (let round = 0; round < MAX_ROUNDS && seen.size < expected.length; round++) {
  // Cada volta ha de ser un quadernet nou. Si queda un intent a mig fer, l'app
  // el reprèn —que és el que ha de fer— i sortirien sempre les mateixes deu.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const request = indexedDB.deleteDatabase('policia-quest')
        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
        request.onblocked = () => resolve()
      }),
  )
  await page.goto(`${BASE}/#/exams`)
  await page.reload()
  await page.waitForSelector('[data-testid="exams"]')
  await page.click('[data-testid="start-exam-roses-cultura-general"]')
  await page.waitForSelector('[data-testid="exam-runner"]')

  for (let i = 0; i < 21; i++) {
    const card = page.locator('[data-testid="exam-question"]')
    const id = await card.getAttribute('data-question-id')
    if (id?.startsWith('actualitat-') && !seen.has(id)) {
      const shot = await card.screenshot({ path: `${OUT}/${id}.png` })
      seen.set(id, shot.toString('base64'))
    }
    const next = page.locator('[data-testid="exam-next"]')
    if (!(await next.isVisible())) break
    await next.click()
  }
}

const missing = expected.filter((id) => !seen.has(id))
console.log(`vistes ${seen.size} de ${expected.length}`)
if (missing.length > 0) console.log(`no vistes: ${missing.join(', ')}`)

/* Fulls de contacte, per poder-les repassar totes sense obrir-ne 25. */
const PER_SHEET = 6
const ordered = expected.filter((id) => seen.has(id))
for (let i = 0; i < ordered.length; i += PER_SHEET) {
  const batch = ordered.slice(i, i + PER_SHEET)
  const sheet = await context.newPage()
  await sheet.setViewportSize({ width: 820, height: 1200 })
  await sheet.setContent(
    `<body style="margin:0;background:#0b1220;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px">` +
      batch
        .map(
          (id) =>
            `<figure style="margin:0"><figcaption style="font:12px/1.6 system-ui;color:#9fb3c8;padding:2px 4px">${id}</figcaption>` +
            `<img src="data:image/png;base64,${seen.get(id)}" style="width:100%;display:block"></figure>`,
        )
        .join('') +
      `</body>`,
  )
  const n = String(i / PER_SHEET + 1).padStart(2, '0')
  await sheet.screenshot({ path: `${OUT}/full-${n}.png`, fullPage: true })
  console.log(`  · full-${n}.png (${batch.length})`)
  await sheet.close()
}

/*
 * I l'altra meitat de la garantia: el dia que caduquen, sense tocar res.
 *
 * Es fa amb el rellotge del navegador avançat més enllà de l'últim `reviewBy`
 * del paquet. El banc és exactament el mateix; l'única cosa que canvia és quin
 * dia és.
 */
const packSource = readFileSync(
  'content/municipalities/roses/current-affairs/pack-2026-08.ts',
  'utf-8',
)
const lastReviewBy = packSource.match(/expiresAt: '(\d{4}-\d{2}-\d{2})'/)?.[1]
if (!lastReviewBy) throw new Error('no s’ha pogut llegir expiresAt del paquet')

const future = new Date(`${lastReviewBy}T09:00:00Z`)
future.setUTCDate(future.getUTCDate() + 1)

const later = await context.newPage()
await later.clock.setFixedTime(future)
await later.goto(`${BASE}/#/exams`)
await later.waitForSelector('[data-testid="blocked-roses-cultura-general"]')
await later.screenshot({ path: `${OUT}/caducat-${future.toISOString().slice(0, 10)}.png` })
console.log(`  · caducat-${future.toISOString().slice(0, 10)}.png (l’endemà de ${lastReviewBy})`)
await later.close()

await browser.close()

if (problems.length > 0) {
  console.log('\nProblemes:')
  for (const p of problems) console.log(`  ✗ ${p}`)
  process.exit(1)
}
if (missing.length > 0) process.exit(1)
console.log('\n✓ Totes les preguntes del paquet s’han vist dins de l’app.')
