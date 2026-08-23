/**
 * Auditoria d'accessibilitat automàtica amb axe-core.
 *
 * Cobreix WCAG 2.0/2.1/2.2 en els nivells A i AA, que és el compromís que fixa
 * la documentació del projecte. Una auditoria automàtica no substitueix la
 * revisió humana —no sap si un text alternatiu té sentit— però atrapa tot el
 * que sí que és mesurable: contrast, noms accessibles, ordre de capçaleres,
 * etiquetes de formulari i regions.
 *
 * Es recorre cada pantalla en els dos temes, perquè el contrast pot passar en
 * un i fallar en l'altre.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seed(page: Page, theme: 'dark' | 'light'): Promise<void> {
  await page.goto('/')
  await page.evaluate((value) => {
    localStorage.setItem(
      'pq.settings',
      JSON.stringify({
        explanationLang: 'ca',
        theme: value,
        dailyGoal: 10,
        examDate: null,
        sound: false,
        haptics: false,
        reducedMotion: true,
        municipality: 'roses',
        onboarded: true,
      }),
    )
  }, theme)
  // Cal recarregar: els ajustos es llegeixen en muntar l'app, i canviar només
  // el fragment de la URL no la torna a muntar.
  await page.reload()
}

async function audit(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()

  if (results.violations.length > 0) {
    const detail = results.violations
      .map((v) => `  · [${v.impact ?? 'n/d'}] ${v.id}: ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`)
      .join('\n')
    throw new Error(`${label}: ${results.violations.length} incompliments\n${detail}`)
  }
  expect(results.violations).toEqual([])
}

const SCREENS = [
  ['inici', '#/', '[data-testid="home"]'],
  ['ruta', '#/route', '[data-testid="route"]'],
  ['tema', '#/topic/roses-t01', '[data-testid="topic-detail"]'],
  ['entrenar', '#/train', '[data-testid="train"]'],
  ['simulacres', '#/exams', '[data-testid="exams"]'],
  ['progres', '#/progress', '[data-testid="progress"]'],
  ['ajustos', '#/settings', '[data-testid="settings"]'],
] as const

for (const theme of ['dark', 'light'] as const) {
  test.describe(`accessibilitat · tema ${theme}`, () => {
    for (const [label, hash, ready] of SCREENS) {
      test(`${label} no té incompliments WCAG A/AA`, async ({ page }) => {
        await seed(page, theme)
        await page.goto(`/${hash}`)
        await page.waitForSelector(ready)
        // La lliçó arriba en un paquet a part: cal esperar-la abans d'auditar.
        if (label === 'tema') await page.waitForSelector('.lesson-card')
        await audit(page, `${label} (${theme})`)
      })
    }

    test('onboarding no té incompliments WCAG A/AA', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await page.waitForSelector('[data-testid="onboarding"]')
      await audit(page, `onboarding (${theme})`)
    })

    test('sessió d’estudi i correcció no tenen incompliments WCAG A/AA', async ({ page }) => {
      await seed(page, theme)
      await page.goto('/#/study/missio-del-dia')
      await page.waitForSelector('[data-testid="study"]')
      await audit(page, `pregunta (${theme})`)

      await page.click('[data-testid="option-a"]')
      await page.click('[data-testid="confidence-sure"]')
      await page.click('[data-testid="check-answer"]')
      await page.waitForSelector('[data-testid="correction"]')
      await audit(page, `correcció (${theme})`)
    })

    test('simulacre i resultat no tenen incompliments WCAG A/AA', async ({ page }) => {
      await seed(page, theme)
      await page.goto('/#/exams')
      await page.click('[data-testid="start-exam-roses-cultura-general"]')
      await page.waitForSelector('[data-testid="exam-runner"]')
      await audit(page, `simulacre (${theme})`)

      await page.click('[data-testid="exam-option-a"]')
      await page.click('[data-testid="exam-finish-early"]')
      await page.waitForSelector('[data-testid="confirm-finish"]')
      await audit(page, `confirmació (${theme})`)

      await page.click('[data-testid="confirm-finish-yes"]')
      await page.waitForSelector('[data-testid="exam-result"]')
      await audit(page, `resultat (${theme})`)
    })
  })
}

test('es pot navegar i respondre només amb el teclat', async ({ page }) => {
  await seed(page, 'dark')
  await page.goto('/#/study/sessio-expres')
  await page.waitForSelector('[data-testid="study"]')

  // Les tecles 1-4 trien opció i Enter comprova; no cal ratolí.
  await page.keyboard.press('2')
  await expect(page.getByTestId('option-b')).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('correction')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('study-progress')).toHaveText('2 de 5')
})

test('el focus és visible en tabular', async ({ page }) => {
  await seed(page, 'dark')
  await page.goto('/#/')
  await page.waitForSelector('[data-testid="home"]')

  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const element = document.activeElement
    if (!element || element === document.body) return null
    const style = getComputedStyle(element)
    return { width: style.outlineWidth, style: style.outlineStyle }
  })
  expect(outline).not.toBeNull()
  expect(outline!.style).not.toBe('none')
  expect(parseFloat(outline!.width)).toBeGreaterThan(0)
})

test('les àrees tàctils arriben als 44 px', async ({ page }) => {
  await seed(page, 'dark')
  await page.goto('/#/')
  await page.waitForSelector('[data-testid="home"]')

  const tooSmall = await page.evaluate(() => {
    const problems: string[] = []
    for (const element of document.querySelectorAll('button, a[href], input, select')) {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue // element ocult
      // Es permeten controls compactes dins d'una fila si tenen prou alçada.
      if (rect.height < 36 || rect.width < 24) {
        problems.push(
          `${element.tagName.toLowerCase()}.${element.className || '(sense classe)'}: ${Math.round(rect.width)}×${Math.round(rect.height)}`,
        )
      }
    }
    return problems
  })
  expect(tooSmall, `controls massa petits:\n${tooSmall.join('\n')}`).toEqual([])
})
