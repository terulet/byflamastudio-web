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

  // 40 preguntes i 60 minuts. El comptador no inclou les reserves.
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/40')
  await expect(page.getByTestId('exam-clock')).toHaveText(/^(59:5\d|60:00)$/)

  // No hi ha correcció durant la prova.
  await page.getByTestId('exam-option-a').click()
  await expect(page.locator('.option--correct')).toHaveCount(0)
  await expect(page.locator('.option--wrong')).toHaveCount(0)

  // Finalitzar amb preguntes en blanc demana confirmació.
  await page.getByTestId('exam-finish-early').click()
  await expect(page.getByTestId('confirm-finish')).toBeVisible()
  // 40 del cos + 2 de reserva = 42 preguntes, una de contestada.
  await expect(page.getByText(/41 preguntes en blanc/)).toBeVisible()
  await page.getByTestId('confirm-finish-yes').click()

  await expect(page.getByTestId('exam-result')).toBeVisible()
  // Amb una sola resposta, la nota és 0,5 (encert) o 0 (error, amb terra a 0).
  await expect(page.getByTestId('exam-score')).toHaveText(/^(0,5|0)\s*\/ 20$/)
  await expect(page.getByTestId('exam-verdict')).toHaveText('NO APTE')
})

test('el simulacre es pot pausar i reprendre amb el temps consumit', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
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
  await expect(page.getByTestId('exam-clock')).not.toHaveText('60:00')
})

/*
 * El simulacre de cultura general i, per tant, el complet, estan bloquejats en
 * aquesta versió: el paquet d'actualitat és buit i les bases exigeixen 10 de
 * les 20 preguntes d'actualitat.
 *
 * Els tests que recorrien les dues proves encadenades no es poden executar
 * mentre això duri —no es pot recórrer una prova que no existeix— i s'han
 * substituït pels que comproven que el bloqueig funciona i s'explica. La
 * mecànica multisecció queda coberta per `tests/unit/exam-sections.test.ts`.
 * Quan s'ompli el paquet d'actualitat, cal recuperar el recorregut complet.
 */
test('el simulacre de cultura general està bloquejat i diu exactament per què', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await expect(page.getByTestId('exams')).toBeVisible()

  const blocked = page.getByTestId('blocked-roses-cultura-general')
  await expect(blocked).toBeVisible()
  await expect(blocked).toContainText('Actualitat')
  await expect(blocked).toContainText('0 de 10')
  await expect(page.getByTestId('start-exam-roses-cultura-general')).toBeDisabled()
})

test('el simulacre complet es bloqueja perquè inclou el de cultura general', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  const blocked = page.getByTestId('blocked-roses-simulacre-complet')
  await expect(blocked).toBeVisible()
  await expect(blocked).toContainText('cultura general')
  await expect(page.getByTestId('start-exam-roses-simulacre-complet')).toBeDisabled()
})

test('un enllaç directe no pot saltar-se el bloqueig', async ({ page }) => {
  await skipOnboarding(page)
  // Una adreça guardada als preferits o compartida no ha d'obrir una prova
  // retallada: ha de topar amb la mateixa explicació.
  await page.goto('/#/exam/roses-cultura-general')
  await expect(page.getByTestId('exam-unavailable')).toBeVisible()
  await expect(page.getByTestId('exam-runner')).toHaveCount(0)
})

test('el simulacre professional sí que es pot muntar sencer', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await expect(page.getByTestId('blocked-roses-coneixements-professionals')).toHaveCount(0)
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  const stored = await page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const request = indexedDB.open('policia-quest')
        request.onsuccess = () => {
          const tx = request.result.transaction('attempts', 'readonly')
          const all = tx.objectStore('attempts').getAll()
          tx.oncomplete = () => resolve(all.result[0]?.questionIds ?? [])
          tx.onerror = () => resolve([])
        }
        request.onerror = () => resolve([])
      }),
  )
  // 40 del cos + 2 de reserva, sense repetir-ne cap.
  expect(stored).toHaveLength(42)
  expect(new Set(stored).size).toBe(42)
})

test('les preguntes de reserva es contesten però no compten per a la nota', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  // El cos són 40 preguntes; les reserves van al final i s'anuncien com a tals.
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/40')
  await expect(page.getByTestId('reserve-notice')).toHaveCount(0)

  for (let i = 0; i < 40; i++) {
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }

  // Pregunta 41: la primera de reserva, amb avís i comptador propi.
  await expect(page.getByTestId('reserve-notice')).toBeVisible()
  await expect(page.getByTestId('toggle-navigator')).toHaveText('R1/2')
  await page.getByTestId('exam-option-a').click()
  await page.getByTestId('exam-next').click()
  await expect(page.getByTestId('toggle-navigator')).toHaveText('R2/2')
  await page.getByTestId('exam-option-a').click()
  await page.getByTestId('exam-finish').click()

  // La nota es calcula sobre 40, no sobre 42, i el resultat ho diu.
  await expect(page.getByTestId('exam-result')).toBeVisible()
  await expect(page.getByTestId('reserve-excluded')).toContainText('fora de la nota')
  const stats = page.locator('.stats')
  const correct = Number(await stats.locator('.stat__value').first().innerText())
  const wrong = Number(await stats.locator('.stat__value').nth(1).innerText())
  const blank = Number(await stats.locator('.stat__value').nth(2).innerText())
  expect(correct + wrong + blank).toBe(40)
})

test('contestar l’última pregunta i finalitzar de seguida no demana confirmació', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  // 40 del cos + 2 de reserva.
  for (let i = 0; i < 42; i++) {
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }
  // Sense esperar cap repintat: el diàleg no pot sortir amb zero en blanc.
  await page.getByTestId('exam-finish').click()
  await expect(page.getByTestId('confirm-finish')).toHaveCount(0)
  await expect(page.getByTestId('exam-result')).toBeVisible()
})

test('l’avís de preguntes en blanc es tanca sol quan ja no en queda cap', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  // Es deixa l'última en blanc i es demana finalitzar: surt l'avís.
  for (let i = 0; i < 41; i++) {
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }
  await page.getByTestId('exam-finish').click()
  await expect(page.getByTestId('confirm-finish')).toBeVisible()
  await expect(page.getByText(/1 pregunta en blanc/)).toBeVisible()

  // L'avís no bloqueja la pregunta: en contestar-la deixa de tenir sentit.
  await page.getByTestId('exam-option-a').click()
  await expect(page.getByTestId('confirm-finish')).toHaveCount(0)
})

test('els errors del simulacre es poden enviar a la cua de repàs', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()

  // Es contesten totes amb la mateixa lletra per garantir errors.
  // 40 del cos i 2 de reserva: es contesten totes, com el dia de l'examen.
  for (let i = 0; i < 42; i++) {
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

test('els filtres d’entrenament arriben a la sessió', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/train')
  await expect(page.getByTestId('train')).toBeVisible()

  // Sense haver estudiat res, "noves" ha de tenir totes les preguntes del tema.
  // El tema 35 (ordenança de circulació) en té 6 des que es va reescriure amb
  // l'articulat real de l'ordenança i la seva modificació de 2021.
  await page.getByTestId('select-topic-35').click()
  await page.getByTestId('filter-state-new').click()
  await expect(page.getByTestId('start-topic-session')).toContainText('6')

  // I "fallades" cap, perquè encara no s'ha fallat res.
  await page.getByTestId('filter-state-failed').click()
  await expect(page.getByTestId('start-topic-session')).toBeDisabled()
  await expect(page.getByText(/No hi ha preguntes que compleixin/)).toBeVisible()

  // Amb els sis quadernets P0 importats, el filtre d'examen oficial ja no avisa
  // que quedarà buit: hi ha preguntes de debò darrere.
  await page.getByTestId('filter-state-new').click()
  await page.getByTestId('filter-origin-official').click()
  await expect(page.getByText(/cap pregunta d’examen oficial importada/)).toHaveCount(0)

  // Els filtres viatgen a la URL i la sessió els aplica.
  await page.getByTestId('filter-origin-authored').click()
  await page.getByTestId('start-topic-session').click()
  await expect(page).toHaveURL(/origin=authored/)
  await expect(page).toHaveURL(/state=new/)
  await expect(page.getByTestId('study')).toBeVisible()
  await expect(page.getByTestId('study-progress')).toContainText('de 6')
})

test('el semàfor de progrés marca en blau els resultats de simulacre', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-coneixements-professionals').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()
  await page.getByTestId('exam-option-a').click()
  await page.getByTestId('exam-finish-early').click()
  await page.getByTestId('confirm-finish-yes').click()
  await expect(page.getByTestId('exam-result')).toBeVisible()

  await page.goto('/#/progress')
  await expect(page.getByTestId('progress')).toBeVisible()
  // El simulacre professional toca els 40 temes: hi ha d'haver marques blaves.
  await expect(page.locator('[data-testid^="exam-marker-"]').first()).toBeVisible()
  await expect(page.getByText(/El punt blau mostra els encerts/)).toBeVisible()
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
  await expect(page.getByTestId('study-progress')).toContainText('de 6')
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
