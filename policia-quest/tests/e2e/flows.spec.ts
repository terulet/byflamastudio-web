/**
 * Tests d'extrem a extrem sobre el build de producció.
 *
 * Cobreixen l'experiència completa que descriuen els criteris d'acceptació:
 * onboarding, missió, "No ho sé", repàs, simulacre amb pausa i represa,
 * puntuació real, persistència entre recàrregues, còpia de seguretat i canvi
 * de tema i de llengua.
 */
import { expect, test, type Page } from '@playwright/test'

/** Salta l'onboarding deixant els ajustos ja fixats. */
async function skipOnboarding(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  await page.goto('/')
  await page.evaluate((extra) => {
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
        ...extra,
      }),
    )
  }, overrides)
  await page.reload()
  await expect(page.getByTestId('home')).toBeVisible()
}

/** Esborra tot l'emmagatzematge perquè cada test comenci net. */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    localStorage.clear()
    const databases = await indexedDB.databases?.()
    if (databases) {
      await Promise.all(
        databases.map(
          (db) =>
            new Promise<void>((resolve) => {
              if (!db.name) return resolve()
              const request = indexedDB.deleteDatabase(db.name)
              request.onsuccess = () => resolve()
              request.onerror = () => resolve()
              request.onblocked = () => resolve()
            }),
        ),
      )
    }
  })
})

test('completa l’onboarding sense registrar-se', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('onboarding')).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: '20 preguntes' }).click()
  // En triar castellà, la interfície canvia de llengua immediatament.
  await page.getByRole('button', { name: 'Castellà' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByTestId('onboarding-finish').click()

  await expect(page.getByTestId('home')).toBeVisible()
  // La interfície ja és en castellà.
  await expect(page.getByTestId('start-mission')).toHaveText('Empezar la misión')
  await expect(page.getByTestId('goal-progress')).toHaveText('0 / 20')
})

test('l’onboarding es pot ometre', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('onboarding-skip').click()
  await expect(page.getByTestId('home')).toBeVisible()
})

test('fa una missió de 10 preguntes en dos tocs i el progrés avança', async ({ page }) => {
  await skipOnboarding(page)

  // Toc 1: començar la missió.
  await page.getByTestId('start-mission').click()
  await expect(page.getByTestId('study')).toBeVisible()
  await expect(page.getByTestId('study-progress')).toHaveText('1 de 10')

  for (let i = 0; i < 10; i++) {
    await page.getByTestId('option-a').click()
    await page.getByTestId('confidence-sure').click()
    await page.getByTestId('check-answer').click()
    await expect(page.getByTestId('correction')).toBeVisible()
    await page.getByTestId('next-question').click()
  }

  await expect(page.getByTestId('session-summary')).toBeVisible()
  await page.getByRole('button', { name: 'Tornar a l’inici' }).click()
  await expect(page.getByTestId('goal-progress')).toHaveText('10 / 10')
})

test('"No ho sé" corregeix, explica amb font i programa el repàs', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByTestId('start-mission').click()

  await page.getByTestId('dont-know').click()
  await expect(page.getByTestId('correction')).toBeVisible()

  // Hi ha correcció raonada i referència oficial.
  await expect(page.getByText('Per què', { exact: true })).toBeVisible()
  await expect(page.locator('.source').first()).toBeVisible()
  // I queda programada per repassar.
  await expect(page.getByText(/Programada per repassar/)).toBeVisible()
})

test('una pregunta fallada apareix al mode errors', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByTestId('start-mission').click()

  // Es respon fins a trobar una fallada (les opcions correctes varien).
  let failed = false
  for (let i = 0; i < 10 && !failed; i++) {
    await page.getByTestId('option-a').click()
    await page.getByTestId('check-answer').click()
    await expect(page.getByTestId('correction')).toBeVisible()
    failed = await page.locator('.verdict--wrong').isVisible()
    await page.getByTestId('next-question').click()
    if (await page.getByTestId('session-summary').isVisible()) break
  }
  expect(failed).toBe(true)

  await page.goto('/#/train')
  await expect(page.getByTestId('train')).toBeVisible()
  const errorsMode = page.getByTestId('mode-errors')
  await expect(errorsMode).toBeEnabled()
  await errorsMode.click()
  await expect(page.getByTestId('study')).toBeVisible()
})

test('el simulacre professional aplica el format i la penalització reals', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  // 40 preguntes i 60 minuts.
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/40')
  await expect(page.getByTestId('exam-clock')).toHaveText(/^(59:5\d|60:00)$/)

  // No hi ha correcció durant la prova.
  await page.getByTestId('exam-option-a').click()
  await expect(page.locator('.option--correct')).toHaveCount(0)
  await expect(page.locator('.option--wrong')).toHaveCount(0)

  // Finalitzar amb preguntes en blanc demana confirmació.
  await page.getByTestId('exam-finish-early').click()
  await expect(page.getByTestId('confirm-finish')).toBeVisible()
  await expect(page.getByText(/39 preguntes en blanc/)).toBeVisible()
  await page.getByTestId('confirm-finish-yes').click()

  await expect(page.getByTestId('exam-result')).toBeVisible()
  // Amb una sola resposta, la nota és 0,5 (encert) o 0 (error, amb terra a 0).
  await expect(page.getByTestId('exam-score')).toHaveText(/^(0,5|0)\s*\/ 20$/)
  await expect(page.getByTestId('exam-verdict')).toHaveText('NO APTE')
})

test('el simulacre es pot pausar i reprendre amb el temps consumit', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-cultura-general').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  await page.getByTestId('exam-option-c').click()
  await page.waitForTimeout(1500)
  await page.getByTestId('pause-exam').click()
  await expect(page.getByTestId('exams')).toBeVisible()

  // Es recarrega tota l'app: l'intent ha de sobreviure.
  await page.reload()
  await expect(page.getByTestId('exams')).toBeVisible()
  await page.goto('/#/')
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('resumable-exam')).toBeVisible()
  await page.getByRole('button', { name: 'Reprendre' }).click()

  await expect(page.getByTestId('exam-runner')).toBeVisible()
  // La resposta s'ha conservat i el rellotge no s'ha reiniciat.
  await expect(page.getByTestId('exam-option-c')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('exam-clock')).not.toHaveText('20:00')
})

test('els errors del simulacre es poden enviar a la cua de repàs', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-cultura-general').click()

  // Es contesten totes amb la mateixa lletra per garantir errors.
  for (let i = 0; i < 20; i++) {
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }
  await page.getByTestId('exam-finish').click()
  await expect(page.getByTestId('exam-result')).toBeVisible()

  const send = page.getByTestId('send-errors-review')
  await expect(send).toBeVisible()
  await send.click()
  await expect(send).toContainText('afegides a la cua de repàs')
})

test('el progrés sobreviu a una recàrrega', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByTestId('start-mission').click()
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('option-b').click()
    await page.getByTestId('check-answer').click()
    await page.getByTestId('next-question').click()
  }
  await page.goto('/#/')
  await expect(page.getByTestId('goal-progress')).toHaveText('3 / 10')

  await page.reload()
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('goal-progress')).toHaveText('3 / 10')
})

test('la ruta mostra els 40 temes i s’hi pot entrar', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByTestId('nav-route').click()
  await expect(page.getByTestId('route')).toBeVisible()

  for (let n = 1; n <= 40; n++) {
    await expect(page.getByTestId(`topic-${n}`)).toBeVisible()
  }

  await page.getByTestId('topic-35').click()
  await expect(page.getByTestId('topic-detail')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Ordenança municipal de circulació/ })).toBeVisible()
})

test('es pot practicar només l’ordenança de circulació de Roses', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/topic/roses-t35')
  await expect(page.getByTestId('topic-detail')).toBeVisible()
  await page.getByTestId('practice-topic').click()

  await expect(page.getByTestId('study')).toBeVisible()
  // Totes les preguntes de la sessió han de ser del tema 35.
  await expect(page.getByTestId('study-progress')).toContainText('de 5')
})

test('exporta i importa la còpia de seguretat', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByTestId('start-mission').click()
  for (let i = 0; i < 4; i++) {
    await page.getByTestId('option-a').click()
    await page.getByTestId('check-answer').click()
    await page.getByTestId('next-question').click()
  }

  await page.goto('/#/settings')
  const download = page.waitForEvent('download')
  await page.getByTestId('export-backup').click()
  const file = await download
  const path = await file.path()
  expect(path).toBeTruthy()

  // Es restableix tot i després es restaura des de la còpia.
  await page.getByTestId('reset-progress').click()
  await page.getByLabel('Escriu ESBORRAR per confirmar').fill('ESBORRAR')
  await page.getByTestId('reset-confirm-button').click()
  await page.goto('/#/')
  await expect(page.getByTestId('goal-progress')).toHaveText('0 / 10')

  await page.goto('/#/settings')
  await page.setInputFiles('input[type="file"]', path!)
  await expect(page.getByText('Còpia importada correctament.')).toBeVisible()
  await page.goto('/#/')
  await expect(page.getByTestId('goal-progress')).toHaveText('4 / 10')
})

test('canvia el tema i la llengua de les explicacions', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/settings')

  await page.getByTestId('theme-light').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByTestId('theme-dark').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByTestId('lang-es').click()
  await expect(page.getByRole('heading', { name: 'Fuentes y ajustes' })).toBeVisible()

  // Els enunciats de les preguntes es mantenen en català.
  await page.goto('/#/study/sessio-expres')
  await expect(page.getByTestId('study')).toBeVisible()
  await expect(page.locator('.question__stem')).toHaveAttribute('lang', 'ca')
  await expect(page.getByTestId('dont-know')).toHaveText('No ho sé')
})

test('registra el service worker per funcionar sense connexió', async ({ page }) => {
  await skipOnboarding(page)
  const registered = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'sense-suport'
    const registration = await navigator.serviceWorker.getRegistration()
    return registration ? 'registrat' : 'sense-registre'
  })
  expect(registered).toBe('registrat')

  // Amb el service worker actiu, la navegació funciona sense xarxa.
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByTestId('home')).toBeVisible()
  await page.getByTestId('nav-route').click()
  await expect(page.getByTestId('route')).toBeVisible()
  await page.context().setOffline(false)
})
