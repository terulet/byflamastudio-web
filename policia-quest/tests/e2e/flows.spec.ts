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
 * El simulacre de cultura general depèn del paquet d'actualitat, que caduca.
 *
 * Amb el paquet de 2026-08 les dues proves es poden recórrer senceres, i és el
 * que comproven els dos primers tests. Els que vénen després comproven el camí
 * contrari **sense buidar el banc**: avancen el rellotge del navegador més
 * enllà de l'última caducitat i miren que l'app es torni a bloquejar sola, amb
 * la mateixa explicació i el mateix tancament de ruta que tenia quan el paquet
 * era buit.
 */
test('el simulacre complet encadena les dues proves amb temps propi', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-simulacre-complet').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()

  // Primera prova: cultura general, 20 preguntes i 20 minuts.
  await expect(page.getByTestId('section-label')).toContainText('Prova 1 de 2')
  await expect(page.getByTestId('section-label')).toContainText('cultura general')
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/20')
  await expect(page.getByTestId('exam-clock')).toHaveText(/^(19:5\d|20:00)$/)

  // 20 del cos i 1 de reserva: es contesten totes, com el dia de l'examen.
  for (let i = 0; i < 21; i++) {
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }
  await page.getByTestId('exam-finish').click()

  // Segona prova: professionals, 40 preguntes i un temporitzador que arrenca de nou.
  await expect(page.getByTestId('section-label')).toContainText('Prova 2 de 2')
  await expect(page.getByTestId('section-label')).toContainText('coneixements professionals')
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/40')
  await expect(page.getByTestId('exam-clock')).toHaveText(/^(59:5\d|60:00)$/)

  await page.getByTestId('exam-option-b').click()
  await page.getByTestId('exam-finish-early').click()
  await expect(page.getByTestId('confirm-finish')).toBeVisible()
  await page.getByTestId('confirm-finish-yes').click()

  // El resultat reporta cada prova per separat, sense sumar-les.
  await expect(page.getByTestId('exam-result')).toBeVisible()
  await expect(page.getByTestId('section-score-0')).toContainText('/ 20')
  await expect(page.getByTestId('section-score-1')).toContainText('/ 20')
  await expect(page.getByTestId('exam-verdict')).toHaveText('NO APTE')
  await expect(page.getByText(/aprovar les dues proves per separat/)).toBeVisible()
})

test('el simulacre complet no repeteix cap pregunta entre les dues proves', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-simulacre-complet').click()
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
  // 20 + 1 de reserva, i 40 + 2 de reserva.
  expect(stored).toHaveLength(63)
  expect(new Set(stored).size).toBe(63)
})

test('el quadernet de cultura general surt 10 i 10, com fixen les bases', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await page.getByTestId('start-exam-roses-cultura-general').click()
  await expect(page.getByTestId('exam-runner')).toBeVisible()
  await expect(page.getByTestId('toggle-navigator')).toHaveText('1/20')

  // Les d'actualitat porten la font i la data de publicació a l'explicació, i
  // es reconeixen pel seu identificador. Es recorre el quadernet sencer.
  const ids: string[] = []
  for (let i = 0; i < 20; i++) {
    ids.push((await page.getByTestId('exam-question').getAttribute('data-question-id')) ?? '')
    await page.getByTestId('exam-option-a').click()
    const next = page.getByTestId('exam-next')
    if (await next.isVisible()) await next.click()
  }
  expect(ids.filter((id) => id.startsWith('actualitat-'))).toHaveLength(10)
  expect(new Set(ids).size).toBe(20)
})

/**
 * El dia que caduca prou actualitat, sense que ningú toqui res.
 *
 * `EXPIRED_DAY` és posterior a l'últim `reviewBy` del paquet: aquell dia queden
 * zero preguntes d'actualitat vigents i el bloqueig ha de tornar sol.
 */
const EXPIRED_DAY = new Date('2027-07-01T09:00:00Z')

test('quan caduca l’actualitat, el simulacre de cultura general es bloqueja sol', async ({
  page,
}) => {
  await page.clock.setFixedTime(EXPIRED_DAY)
  await skipOnboarding(page)
  await page.goto('/#/exams')
  await expect(page.getByTestId('exams')).toBeVisible()

  const blocked = page.getByTestId('blocked-roses-cultura-general')
  await expect(blocked).toBeVisible()
  await expect(blocked).toContainText('Actualitat')
  await expect(blocked).toContainText('0 de 10')
  await expect(page.getByTestId('start-exam-roses-cultura-general')).toBeDisabled()
})

test('i el complet es bloqueja amb ell, perquè l’inclou', async ({ page }) => {
  await page.clock.setFixedTime(EXPIRED_DAY)
  await skipOnboarding(page)
  await page.goto('/#/exams')
  const blocked = page.getByTestId('blocked-roses-simulacre-complet')
  await expect(blocked).toBeVisible()
  await expect(blocked).toContainText('cultura general')
  await expect(page.getByTestId('start-exam-roses-simulacre-complet')).toBeDisabled()
})

test('un enllaç directe no pot saltar-se el bloqueig', async ({ page }) => {
  await page.clock.setFixedTime(EXPIRED_DAY)
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

test('la confiança només compta quan es declara, i «segur però incorrecte» existeix', async ({
  page,
}) => {
  await skipOnboarding(page)

  // Primera sessió: tema 29, totes les claus són «b». S'encerta tot sense
  // tocar el selector de confiança: al panell no hi ha d'aparèixer res,
  // perquè no declarar-se no és declarar-se segur.
  await page.goto('/#/train')
  await page.getByTestId('select-topic-29').click()
  await page.getByTestId('start-topic-session').click()
  await expect(page.getByTestId('study-question')).toBeVisible()
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('option-b').click()
    await page.getByTestId('check-answer').click()
    await expect(page.getByTestId('correction')).toBeVisible()
    const next = page.getByTestId('next-question')
    if (await next.isVisible().catch(() => false)) await next.click()
  }
  await expect(page.getByTestId('session-summary')).toBeVisible()
  // Tot encertat: cap nota de repàs ni botó d'errors.
  await expect(page.getByTestId('summary-review-note')).toHaveCount(0)
  await expect(page.getByTestId('summary-retry-errors')).toHaveCount(0)
  await page.getByRole('button', { name: /Tornar a l’inici/ }).click()

  await page.goto('/#/progress')
  await expect(page.getByTestId('progress')).toBeVisible()
  await expect(page.getByTestId('confidence-sure-correct')).toHaveCount(0)

  // Segona sessió: tema 30, claus «c b c a d». Es contesta tot «a» declarant
  // «Ho tinc clar»: 1 encert segur i 4 errades segures, deterministes.
  await page.goto('/#/train')
  await page.getByTestId('select-topic-30').click()
  await page.getByTestId('start-topic-session').click()
  await expect(page.getByTestId('study-question')).toBeVisible()
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('confidence-sure').click()
    await page.getByTestId('option-a').click()
    await page.getByTestId('check-answer').click()
    await expect(page.getByTestId('correction')).toBeVisible()
    const next = page.getByTestId('next-question')
    if (await next.isVisible().catch(() => false)) await next.click()
  }
  await expect(page.getByTestId('session-summary')).toBeVisible()
  // El resum tanca el cercle: diu que els errors són a la cua i ofereix
  // repassar-los ara mateix.
  await expect(page.getByTestId('summary-review-note')).toBeVisible()
  await page.getByTestId('summary-retry-errors').click()
  await expect(page.getByTestId('study-question')).toBeVisible()
  await page.goto('/#/progress')

  await expect(page.getByTestId('confidence-sure-correct')).toHaveText('1')
  await expect(page.getByTestId('confidence-sure-wrong')).toHaveText('4')
  await expect(page.getByTestId('confidence-unsure-correct')).toHaveText('0')
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

  // El filtre d'examen oficial no depèn de la selecció de temes: aquestes
  // preguntes viuen al tema contenidor dels quadernets, que no és al selector.
  // Ha d'explicar-ho i deixar començar la sessió igualment.
  await page.getByTestId('filter-state-new').click()
  await page.getByTestId('filter-origin-official').click()
  await expect(page.getByText(/cap pregunta d’examen oficial importada/)).toHaveCount(0)
  await expect(page.getByText(/no estan classificades per tema/)).toBeVisible()
  await expect(page.getByTestId('start-topic-session')).toBeEnabled()
  await page.getByTestId('start-topic-session').click()
  await expect(page.getByTestId('study-question')).toBeVisible()
  // Cada pregunta oficial porta la data del seu examen a la vista.
  await expect(page.getByTestId('official-badge')).toBeVisible()
  await page.goBack()
  await expect(page.getByTestId('train')).toBeVisible()
  await page.getByTestId('select-topic-35').click()
  await page.getByTestId('filter-state-new').click()

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
