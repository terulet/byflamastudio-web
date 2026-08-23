/**
 * Comprovació ràpida amb navegador real: recorre l'app, informa dels errors de
 * consola i dels recursos 404, i deixa una captura de cada pantalla.
 *
 * No substitueix els tests E2E; serveix per veure de debò què es renderitza.
 */
import { chromium } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const OUT = 'artifacts/screenshots'
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  ...(existsSync(CHROME) ? { executablePath: CHROME } : {}),
})

const problems = []

/**
 * Les captures es fan a escala 1: són per revisar la interfície, no per
 * publicar-les. A escala 2 el conjunt passava de 9 MB, que és massa pes per a
 * un repositori que a més serveix una web estàtica.
 */
async function shoot(page, name, fullPage = true) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log(`  · ${name}.png`)
}

function watch(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`[${label}] consola: ${msg.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`[${label}] excepció: ${error.message}`))
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`[${label}] ${response.status()} ${response.url()}`)
  })
}

/* ---------------- Mòbil 393×852 ---------------- */

const mobile = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 1,
  locale: 'ca-ES',
})
const page = await mobile.newPage()
watch(page, 'mobil')

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="onboarding"]')
await shoot(page, '01-onboarding')

await page.click('text=Continuar')
await page.click('text=Continuar')
await page.click('[data-testid="onboarding-finish"]')
await page.waitForSelector('[data-testid="home"]')
await shoot(page, '02-inici')

await page.click('[data-testid="nav-route"]')
await page.waitForSelector('[data-testid="route"]')
await shoot(page, '03-ruta')

await page.click('[data-testid="topic-1"]')
await page.waitForSelector('[data-testid="topic-detail"]')
await page.waitForTimeout(400) // la lliçó arriba en un paquet a part
await shoot(page, '04-tema-lliso')

await page.goto(`${BASE}/#/study/missio-del-dia`)
await page.waitForSelector('[data-testid="study"]')
await shoot(page, '05-pregunta')

await page.click('[data-testid="option-a"]')
await page.click('[data-testid="confidence-sure"]')
await page.click('[data-testid="check-answer"]')
await page.waitForSelector('[data-testid="correction"]')
await shoot(page, '06-correccio')

await page.goto(`${BASE}/#/exams`)
await page.waitForSelector('[data-testid="exams"]')
await shoot(page, '07-simulacres')

await page.click('[data-testid="start-exam-roses-coneixements-professionals"]')
await page.waitForSelector('[data-testid="exam-runner"]')
await page.click('[data-testid="exam-option-b"]')
await shoot(page, '08-simulacre-en-curs')

await page.click('[data-testid="exam-finish-early"]')
await page.waitForSelector('[data-testid="confirm-finish"]')
await page.click('[data-testid="confirm-finish-yes"]')
await page.waitForSelector('[data-testid="exam-result"]')
await shoot(page, '09-resultat-simulacre')

// Simulacre complet: dues proves encadenades
await page.goto(`${BASE}/#/exams`)
await page.click('[data-testid="start-exam-roses-simulacre-complet"]')
await page.waitForSelector('[data-testid="exam-runner"]')
await shoot(page, '18-simulacre-complet-prova-1', false)
for (let i = 0; i < 20; i++) {
  await page.click('[data-testid="exam-option-a"]')
  const next = page.locator('[data-testid="exam-next"]')
  if (await next.isVisible()) await next.click()
}
await page.click('[data-testid="exam-finish"]')
await page.waitForTimeout(300)
await shoot(page, '19-simulacre-complet-prova-2', false)
await page.click('[data-testid="exam-option-b"]')
await page.click('[data-testid="exam-finish-early"]')
await page.waitForSelector('[data-testid="confirm-finish"]')
await page.click('[data-testid="confirm-finish-yes"]')
await page.waitForSelector('[data-testid="exam-result"]')
await shoot(page, '20-simulacre-complet-resultat', false)

await page.click('[data-testid="nav-progress"]')
await page.waitForSelector('[data-testid="progress"]')
await shoot(page, '10-progres')

await page.goto(`${BASE}/#/train`)
await page.waitForSelector('[data-testid="train"]')
await shoot(page, '11-entrenar')

// Tema clar
await page.goto(`${BASE}/#/settings`)
await page.waitForSelector('[data-testid="settings"]')
await page.click('[data-testid="theme-light"]')
await page.waitForTimeout(250)
await shoot(page, '12-ajustos-tema-clar', false)

await page.goto(`${BASE}/#/`)
await page.waitForSelector('[data-testid="home"]')
await shoot(page, '13-inici-tema-clar')

// Comprovació de desbordament horitzontal
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
)
if (overflow) problems.push('[mobil 393] hi ha scroll horitzontal a la pantalla d’inici')

await mobile.close()

/* ---------------- Mòbil estret 320×640 ---------------- */

const narrow = await browser.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1 })
const narrowPage = await narrow.newPage()
watch(narrowPage, 'estret')
await narrowPage.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
await narrowPage.evaluate(() =>
  localStorage.setItem('pq.settings', JSON.stringify({ onboarded: true, explanationLang: 'ca', theme: 'dark', dailyGoal: 10, examDate: null, sound: false, haptics: true, reducedMotion: false, municipality: 'roses' })),
)
await narrowPage.reload({ waitUntil: 'networkidle' })
await narrowPage.waitForSelector('[data-testid="home"]')
await shoot(narrowPage, '14-mobil-estret-320')
const narrowOverflow = await narrowPage.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
)
if (narrowOverflow) problems.push('[mobil 320] hi ha scroll horitzontal')
await narrow.close()

/* ---------------- iPhone 390×844 i tauleta 768×1024 ---------------- */

for (const [name, width, height] of [
  ['15-iphone-390x844', 390, 844],
  ['16-tauleta-768x1024', 768, 1024],
  ['17-escriptori-1280x900', 1280, 900],
]) {
  const context = await browser.newContext({ viewport: { width, height } })
  const p = await context.newPage()
  watch(p, name)
  await p.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
  await p.evaluate(() =>
    localStorage.setItem('pq.settings', JSON.stringify({ onboarded: true, explanationLang: 'ca', theme: 'dark', dailyGoal: 10, examDate: null, sound: false, haptics: true, reducedMotion: false, municipality: 'roses' })),
  )
  await p.reload({ waitUntil: 'networkidle' })
  await p.goto(`${BASE}/#/route`)
  await p.waitForSelector('[data-testid="route"]')
  await shoot(p, name)
  const of = await p.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  if (of) problems.push(`[${name}] hi ha scroll horitzontal`)
  await context.close()
}

await browser.close()

console.log('')
if (problems.length === 0) {
  console.log('✓ Cap error de consola, cap 404 i cap desbordament horitzontal.')
} else {
  console.error(`${problems.length} problemes detectats:`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exitCode = 1
}
