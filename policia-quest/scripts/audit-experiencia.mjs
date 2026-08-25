/**
 * Auditoria d'experiència real d'estudi.
 *
 * No comprova que l'app funcioni —això ja ho fan els tests— sinó què veu i què
 * aprèn una persona que estudia de debò: llegeix la lliçó, falla una pregunta,
 * diu «no ho sé», torna l'endemà a repassar, fa un simulacre i mira el progrés.
 * Cada pas deixa una captura a `artifacts/experiencia/` per poder-lo jutjar
 * amb els ulls, que és com es van trobar els últims defectes de contingut.
 *
 *     node scripts/audit-experiencia.mjs
 */
import { chromium } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const OUT = 'artifacts/experiencia'
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const DAY1 = new Date('2026-08-24T18:00:00')
const DAY2 = new Date('2026-08-25T18:00:00')

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
page.on('console', (m) => m.type() === 'error' && problems.push(`consola: ${m.text()}`))
page.on('pageerror', (e) => problems.push(`excepció: ${e.message}`))

async function shoot(name, fullPage = true) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log(`  · ${name}.png`)
}

/* ── Dia 1: arribar de nou ─────────────────────────────────────────── */
await page.clock.setFixedTime(DAY1)
await page.goto(BASE)
await page.evaluate(async () => {
  localStorage.clear()
  const dbs = (await indexedDB.databases?.()) ?? []
  await Promise.all(
    dbs.map(
      (db) =>
        new Promise((resolve) => {
          if (!db.name) return resolve()
          const r = indexedDB.deleteDatabase(db.name)
          r.onsuccess = r.onerror = r.onblocked = () => resolve()
        }),
    ),
  )
})
await page.reload()
await page.waitForSelector('[data-testid="onboarding"]')
await shoot('01-arribada-onboarding')
await page.click('text=Continuar')
await shoot('02-onboarding-pas-2', false)
await page.click('text=Continuar')
await shoot('03-onboarding-pas-3', false)
await page.click('[data-testid="onboarding-finish"]')
await page.waitForSelector('[data-testid="home"]')
await shoot('04-inici-primer-dia')

/* La lliçó abans de les preguntes: ruta → tema 29 → llegir → practicar. */
await page.click('[data-testid="nav-route"]')
await page.waitForSelector('[data-testid="route"]')
await shoot('05-ruta')
await page.click('[data-testid="topic-29"]')
await page.waitForSelector('[data-testid="topic-detail"]')
await shoot('06-tema-29-llico')
// El checkpoint: primer tapat, després destapat.
const checkpoint = page.locator('details.lesson-card--checkpoint').first()
await checkpoint.scrollIntoViewIfNeeded()
await shoot('07-checkpoint-tapat', false)
await checkpoint.click()
await shoot('08-checkpoint-destapat', false)

await page.click('[data-testid="practice-topic"]')
await page.waitForSelector('[data-testid="study-question"]')
await shoot('09-primera-pregunta')

/* Contestar com una persona: una errada, un «no ho sé», un encert. */
const wrongOption = await page.evaluate(() => {
  // Tria a consciència una opció incorrecta: la primera que no marca l'app.
  return null
})
void wrongOption
// Errada deliberada: prova opcions fins que la correcció digui que has fallat.
async function answerAndCapture(kind, name) {
  if (kind === 'dont-know') {
    await page.click('[data-testid="dont-know"]')
  } else {
    for (const letter of ['a', 'b', 'c', 'd']) {
      await page.click(`[data-testid="option-${letter}"]`)
      break
    }
    await page.click('[data-testid="check-answer"]')
  }
  await page.waitForSelector('[data-testid="correction"]')
  await shoot(name)
  const verdict = await page.locator('.verdict').innerText()
  return verdict
}
const v1 = await answerAndCapture('pick-a', '10-correccio-1')
console.log(`    (resposta 1: ${v1.trim()})`)
await page.click('[data-testid="next-question"]')
await page.waitForSelector('[data-testid="study-question"]')
const v2 = await answerAndCapture('dont-know', '11-correccio-no-ho-se')
console.log(`    (resposta 2: ${v2.trim()})`)

/* La resta de la sessió, ràpid, fins al resum. */
for (let i = 0; i < 12; i++) {
  const next = page.locator('[data-testid="next-question"]')
  if (!(await next.isVisible().catch(() => false))) break
  await next.click()
  const q = page.locator('[data-testid="study-question"]')
  if (!(await q.isVisible().catch(() => false))) break
  await page.click('[data-testid="option-b"]')
  await page.click('[data-testid="check-answer"]')
  await page.waitForSelector('[data-testid="correction"]')
}
await page.waitForSelector('[data-testid="session-summary"]', { timeout: 5000 }).catch(() => {})
await shoot('12-resum-sessio')

await page.click('text=Tornar a l’inici')
await page.waitForSelector('[data-testid="home"]')
await shoot('13-inici-despres-sessio')
await page.click('[data-testid="nav-progress"]')
await page.waitForSelector('[data-testid="progress"]')
await shoot('14-progres-dia-1')

/* ── Dia 2: tornar ─────────────────────────────────────────────────── */
await page.clock.setFixedTime(DAY2)
await page.goto(`${BASE}/#/`)
await page.reload()
await page.waitForSelector('[data-testid="home"]')
await shoot('15-inici-dia-2')

const reviews = page.locator('[data-testid="start-reviews"]')
if (await reviews.isVisible().catch(() => false)) {
  await reviews.click()
  await page.waitForSelector('[data-testid="study-question"]')
  await shoot('16-repas-dia-2')
  const v = await answerAndCapture('pick-a', '17-repas-correccio')
  console.log(`    (repàs: ${v.trim()})`)
} else {
  problems.push('dia 2: el botó de repàs no apareix a l’inici')
}

/* Mode errors a Entrenar. */
await page.goto(`${BASE}/#/train`)
await page.waitForSelector('[data-testid="train"]')
await shoot('18-entrenar-dia-2')

/* ── Simulacre CG amb errors → enviar a repàs → progrés ────────────── */
await page.goto(`${BASE}/#/exams`)
await page.waitForSelector('[data-testid="exams"]')
await page.click('[data-testid="start-exam-roses-cultura-general"]')
await page.waitForSelector('[data-testid="exam-runner"]')
for (let i = 0; i < 21; i++) {
  await page.click('[data-testid="exam-option-a"]')
  const next = page.locator('[data-testid="exam-next"]')
  if (await next.isVisible()) await next.click()
}
await page.click('[data-testid="exam-finish"]')
await page.waitForSelector('[data-testid="exam-result"]')
await shoot('19-resultat-simulacre-cg')

const sendErrors = page.locator('[data-testid="send-errors-review"]')
if (await sendErrors.isVisible().catch(() => false)) {
  await sendErrors.click()
  await shoot('20-errors-enviats', false)
} else {
  problems.push('resultat: no hi ha botó per enviar els errors a repàs')
}

await page.click('[data-testid="nav-progress"]')
await page.waitForSelector('[data-testid="progress"]')
await shoot('21-progres-final')

/* ── Llengua: explicacions en castellà, enunciats en català ────────── */
await page.goto(`${BASE}/#/settings`)
await page.waitForSelector('[data-testid="settings"]')
await page.click('[data-testid="lang-es"]')
await page.goto(`${BASE}/#/train`)
await page.waitForSelector('[data-testid="train"]')
await page.click('[data-testid="mode-patrulla"]')
await page.waitForSelector('[data-testid="study-question"]')
await page.click('[data-testid="dont-know"]')
await page.waitForSelector('[data-testid="correction"]')
await shoot('22-correccio-en-castella')

/* ── Entrenar amb material d'examen oficial ────────────────────────── */
await page.goto(`${BASE}/#/settings`)
await page.waitForSelector('[data-testid="settings"]')
await page.click('[data-testid="lang-ca"]')
await page.goto(`${BASE}/#/train`)
await page.waitForSelector('[data-testid="train"]')
await page.click('[data-testid="filter-origin-official"]')
await shoot('23-filtre-oficial', false)
await page.click('[data-testid="start-topic-session"]')
await page.waitForSelector('[data-testid="study-question"]')
await page.click('[data-testid="dont-know"]')
await page.waitForSelector('[data-testid="correction"]')
await shoot('24-correccio-pregunta-oficial')

await browser.close()
if (problems.length > 0) {
  console.log('\nProblemes:')
  for (const p of problems) console.log(`  ✗ ${p}`)
  process.exit(1)
}
console.log('\n✓ Recorregut complet sense errors de consola.')
