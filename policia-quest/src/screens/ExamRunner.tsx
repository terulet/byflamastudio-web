/**
 * Simulacre.
 *
 * Diferències clau respecte al mode estudi:
 *  - No hi ha correcció fins al final.
 *  - Hi ha temporitzador visible i navegació lliure dins la prova en curs.
 *  - L'intent es desa a cada canvi, de manera que tancar l'app no el perd.
 *  - En finalitzar amb preguntes en blanc, es demana confirmació.
 *
 * Un simulacre pot tenir **una o dues seccions**. El complet encadena cultura
 * general i coneixements professionals, cadascuna amb el seu temps i les seves
 * regles: quan acaba la primera prova ja no s'hi pot tornar, igual que el dia
 * de l'examen.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { pack, useActions, useApp } from '../app/store.tsx'
import { useActiveQuestions } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, fill, pick } from '../i18n/index.ts'
import { buildExamPaper } from '../engines/selection.ts'
import { scoreExam, type ScoredItem } from '../engines/scoring.ts'
import { formatClock } from '../util/date.ts'
import type { ExamAttempt, ExamBlueprint, OptionId, Question } from '../domain/types.ts'

/** Índex de la primera pregunta de cada secció dins `questionIds`. */
export function sectionOffsets(sections: readonly { count: number }[]): number[] {
  const offsets: number[] = []
  let running = 0
  for (const section of sections) {
    offsets.push(running)
    running += section.count
  }
  return offsets
}

/** Plànols d'un objectiu, que pot ser un plànol solt o una composició. */
function blueprintsFor(targetId: string): ExamBlueprint[] {
  const composition = pack.compositions.find((c) => c.compositionId === targetId)
  if (composition) {
    return composition.blueprintIds
      .map((id) => pack.blueprints.find((b) => b.blueprintId === id))
      .filter((b): b is ExamBlueprint => b !== undefined)
  }
  const single = pack.blueprints.find((b) => b.blueprintId === targetId)
  return single ? [single] : []
}

export function ExamRunner({ blueprintId }: { blueprintId: string }): ReactNode {
  const { settings, attempts } = useApp()
  const { saveAttempt } = useActions()
  const lang = settings.explanationLang
  const t = dict(lang)
  const active = useActiveQuestions()

  const blueprints = useMemo(() => blueprintsFor(blueprintId), [blueprintId])
  const composition = useMemo(
    () => pack.compositions.find((c) => c.compositionId === blueprintId) ?? null,
    [blueprintId],
  )

  const [attempt, setAttempt] = useState<ExamAttempt | null>(() => {
    const resumable = attempts.find(
      (a) =>
        a.status === 'in-progress' &&
        (a.compositionId === blueprintId || (!a.compositionId && a.blueprintIds[0] === blueprintId)),
    )
    if (resumable) return resumable
    if (blueprints.length === 0) return null

    const questionIds: string[] = []
    const sections: ExamAttempt['sections'] = []
    const seed = `${blueprintId}-${Date.now()}`

    for (const blueprint of blueprints) {
      const paper = buildExamPaper({
        pool: active,
        track: blueprint.track,
        count: blueprint.questionCount,
        seed: `${seed}-${blueprint.blueprintId}`,
        // Cap pregunta pot sortir dues vegades al mateix quadernet complet.
        exclude: questionIds,
      })
      if (paper.length === 0) continue
      questionIds.push(...paper.map((q) => q.questionId))
      sections.push({
        blueprintId: blueprint.blueprintId,
        count: paper.length,
        durationMs: blueprint.durationMinutes * 60_000,
        elapsedMs: 0,
        finished: false,
      })
    }

    if (sections.length === 0) return null

    return {
      attemptId: `a-${Date.now()}`,
      blueprintIds: sections.map((s) => s.blueprintId),
      ...(composition ? { compositionId: composition.compositionId } : {}),
      questionIds,
      responses: questionIds.map(() => null),
      flagged: questionIds.map(() => false),
      startedAt: Date.now(),
      durationMs: sections.reduce((sum, s) => sum + s.durationMs, 0),
      elapsedMsAtPause: 0,
      sections,
      currentSection: 0,
      status: 'in-progress',
      sectionScoresMilli: [],
      currentIndex: 0,
    }
  })

  const [index, setIndex] = useState(attempt?.currentIndex ?? 0)
  const [showNavigator, setShowNavigator] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [now, setNow] = useState(Date.now())
  const resumedAt = useRef(Date.now())

  const questionsById = useMemo(() => new Map(pack.questions.map((q) => [q.questionId, q])), [])
  const questions = useMemo(
    () =>
      (attempt?.questionIds ?? [])
        .map((id) => questionsById.get(id))
        .filter((q): q is Question => q !== undefined),
    [attempt?.questionIds, questionsById],
  )

  const offsets = useMemo(() => sectionOffsets(attempt?.sections ?? []), [attempt?.sections])
  const sectionIndex = attempt?.currentSection ?? 0
  const section = attempt?.sections[sectionIndex]
  const sectionStart = offsets[sectionIndex] ?? 0
  const sectionEnd = sectionStart + (section?.count ?? 0)
  const isLastSection = sectionIndex >= (attempt?.sections.length ?? 1) - 1

  const elapsedInSection = (section?.elapsedMs ?? 0) + (now - resumedAt.current)
  const remainingMs = Math.max(0, (section?.durationMs ?? 0) - elapsedInSection)

  /** Desa l'intent acumulant el temps consumit a la secció en curs. */
  const persist = useCallback(
    (patch: Partial<ExamAttempt>) => {
      setAttempt((current) => {
        if (!current) return current
        const delta = Date.now() - resumedAt.current
        const sections = current.sections.map((s, i) =>
          i === current.currentSection ? { ...s, elapsedMs: s.elapsedMs + delta } : s,
        )
        const next: ExamAttempt = {
          ...current,
          sections,
          elapsedMsAtPause: current.elapsedMsAtPause + delta,
          ...patch,
        }
        resumedAt.current = Date.now()
        saveAttempt(next)
        return next
      })
    },
    [saveAttempt],
  )

  /** Puntua totes les seccions amb les regles del seu plànol i tanca l'intent. */
  const finish = useCallback(() => {
    setAttempt((current) => {
      if (!current) return current
      const delta = Date.now() - resumedAt.current
      const sections = current.sections.map((s, i) =>
        i === current.currentSection ? { ...s, elapsedMs: s.elapsedMs + delta, finished: true } : { ...s, finished: true },
      )
      const localOffsets = sectionOffsets(sections)

      const sectionScoresMilli = sections.map((s, i) => {
        const blueprint = pack.blueprints.find((b) => b.blueprintId === s.blueprintId)
        if (!blueprint) return 0
        const from = localOffsets[i] ?? 0
        const items: ScoredItem[] = current.questionIds.slice(from, from + s.count).map((id, j) => {
          const question = questionsById.get(id)
          return { chosen: current.responses[from + j] ?? null, correct: question?.correct ?? 'a' }
        })
        return scoreExam(items, blueprint.scoring).scoreMilli
      })

      const next: ExamAttempt = {
        ...current,
        sections,
        elapsedMsAtPause: current.elapsedMsAtPause + delta,
        status: 'finished',
        finishedAt: Date.now(),
        sectionScoresMilli,
        scoreMilli: sectionScoresMilli.reduce((sum, value) => sum + value, 0),
      }
      resumedAt.current = Date.now()
      saveAttempt(next)
      navigate({ name: 'result', attemptId: next.attemptId })
      return next
    })
  }, [questionsById, saveAttempt])

  /** Tanca la prova en curs i passa a la següent, com el dia de l'examen. */
  const advanceSection = useCallback(() => {
    setAttempt((current) => {
      if (!current) return current
      const delta = Date.now() - resumedAt.current
      const nextSection = current.currentSection + 1
      const sections = current.sections.map((s, i) =>
        i === current.currentSection ? { ...s, elapsedMs: s.elapsedMs + delta, finished: true } : s,
      )
      const localOffsets = sectionOffsets(sections)
      const next: ExamAttempt = {
        ...current,
        sections,
        elapsedMsAtPause: current.elapsedMsAtPause + delta,
        currentSection: nextSection,
        currentIndex: localOffsets[nextSection] ?? 0,
      }
      resumedAt.current = Date.now()
      saveAttempt(next)
      setIndex(localOffsets[nextSection] ?? 0)
      return next
    })
    setConfirmFinish(false)
    setShowNavigator(false)
  }, [saveAttempt])

  const closeSection = useCallback(() => {
    if (isLastSection) finish()
    else advanceSection()
  }, [isLastSection, finish, advanceSection])

  /*
   * Desa l'intent tot just creat.
   *
   * Sense això, un simulacre obert i abandonat abans de tocar res no existiria
   * enlloc i no es podria reprendre: el quadernet ja està muntat i el rellotge
   * ja corre, de manera que ha de ser recuperable des del primer segon.
   */
  const persistedOnce = useRef(false)
  useEffect(() => {
    if (!attempt || persistedOnce.current) return
    persistedOnce.current = true
    saveAttempt(attempt)
  }, [attempt, saveAttempt])

  // Rellotge: un tic per segon, prou per a un temporitzador d'examen.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Guardat d'emergència: si l'app es tanca, el temps consumit queda desat.
  useEffect(() => {
    const onHide = (): void => {
      if (attempt?.status === 'in-progress') persist({ currentIndex: index })
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [attempt?.status, index, persist])

  // En esgotar-se el temps d'una prova, es tanca sola i passa a la següent.
  useEffect(() => {
    if (attempt?.status === 'in-progress' && section && remainingMs <= 0) closeSection()
  }, [remainingMs, attempt?.status, section, closeSection])

  if (blueprints.length === 0 || !attempt || !section) {
    return (
      <main className="screen screen--full">
        <p className="empty">{t.common.loading}</p>
        <button type="button" className="btn btn--block" onClick={() => navigate({ name: 'exams' })}>
          {t.common.back}
        </button>
      </main>
    )
  }

  const blueprint = pack.blueprints.find((b) => b.blueprintId === section.blueprintId)
  const question = questions[index]
  const sectionResponses = attempt.responses.slice(sectionStart, sectionEnd)
  const answeredCount = sectionResponses.filter((r) => r !== null).length
  const blankCount = sectionResponses.length - answeredCount
  const flaggedCount = attempt.flagged.slice(sectionStart, sectionEnd).filter(Boolean).length
  const urgent = remainingMs < 120_000
  const positionInSection = index - sectionStart + 1

  const choose = (optionId: OptionId): void => {
    const responses = [...attempt.responses]
    responses[index] = responses[index] === optionId ? null : optionId
    persist({ responses, currentIndex: index })
  }

  const toggleFlagged = (): void => {
    const flagged = [...attempt.flagged]
    flagged[index] = !flagged[index]
    persist({ flagged, currentIndex: index })
  }

  return (
    <main className="screen screen--full" data-testid="exam-runner">
      <div className="exam-bar">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            persist({ currentIndex: index })
            navigate({ name: 'exams' })
          }}
          data-testid="pause-exam"
        >
          {t.exams.pause}
        </button>

        <span
          className={urgent ? 'clock clock--urgent' : 'clock'}
          role="timer"
          aria-live="off"
          data-testid="exam-clock"
        >
          {formatClock(remainingMs)}
        </span>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setShowNavigator((v) => !v)}
          aria-expanded={showNavigator}
          data-testid="toggle-navigator"
        >
          {positionInSection}/{section.count}
        </button>
      </div>

      {/* Indicador de prova, només quan n'hi ha més d'una */}
      {attempt.sections.length > 1 ? (
        <p className="notice" style={{ marginBottom: 'var(--sp-4)' }} data-testid="section-label">
          {fill(t.exams.sectionOf, {
            current: sectionIndex + 1,
            total: attempt.sections.length,
          })}
          {blueprint ? ` · ${pick(blueprint.title, lang)}` : ''}
        </p>
      ) : null}

      {showNavigator ? (
        <section className="stack" style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="row row--wrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span>{answeredCount} {t.exams.answered}</span>
            <span>· {blankCount} {t.exams.blank}</span>
            <span>· {flaggedCount} {t.exams.flagged}</span>
          </div>
          <div className="grid-nav" aria-label={t.exams.navigator}>
            {attempt.questionIds.slice(sectionStart, sectionEnd).map((id, i) => {
              const absolute = sectionStart + i
              const classes = ['grid-nav__cell']
              if (attempt.responses[absolute]) classes.push('grid-nav__cell--answered')
              if (attempt.flagged[absolute]) classes.push('grid-nav__cell--flagged')
              if (absolute === index) classes.push('grid-nav__cell--current')
              return (
                <button
                  key={id}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => {
                    setIndex(absolute)
                    setShowNavigator(false)
                  }}
                  aria-label={`${t.common.question} ${i + 1}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {question ? (
        <section className="stack" key={question.questionId}>
          <h2 className="question__stem" lang="ca">
            {question.stem}
          </h2>

          <fieldset className="options">
            <legend className="visually-hidden">{question.stem}</legend>
            {question.options.map((option, i) => (
              <button
                key={option.optionId}
                type="button"
                className={
                  attempt.responses[index] === option.optionId ? 'option option--selected' : 'option'
                }
                aria-pressed={attempt.responses[index] === option.optionId}
                onClick={() => choose(option.optionId)}
                data-testid={`exam-option-${option.optionId}`}
              >
                <span className="option__letter" aria-hidden="true">
                  {String.fromCharCode(97 + i)}
                </span>
                <span lang="ca">{option.text}</span>
              </button>
            ))}
          </fieldset>

          <div className="row row--between">
            <button
              type="button"
              className="btn btn--sm"
              onClick={toggleFlagged}
              aria-pressed={attempt.flagged[index] ?? false}
            >
              {attempt.flagged[index] ? `★ ${t.exams.marked}` : `☆ ${t.exams.markReview}`}
            </button>
          </div>

          <div className="row">
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              disabled={index <= sectionStart}
              onClick={() => setIndex((i) => Math.max(sectionStart, i - 1))}
            >
              ← {t.common.previous}
            </button>
            {index + 1 < sectionEnd ? (
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => setIndex((i) => i + 1)}
                data-testid="exam-next"
              >
                {t.common.next} →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => (blankCount > 0 ? setConfirmFinish(true) : closeSection())}
                data-testid="exam-finish"
              >
                {isLastSection ? t.common.finish : t.exams.nextSection}
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--block btn--sm"
            onClick={() => (blankCount > 0 ? setConfirmFinish(true) : closeSection())}
            data-testid="exam-finish-early"
          >
            {isLastSection ? t.exams.confirmFinish : t.exams.confirmNextSection}
          </button>
        </section>
      ) : null}

      {confirmFinish ? (
        <div
          className="card"
          role="alertdialog"
          aria-label={isLastSection ? t.exams.confirmFinish : t.exams.confirmNextSection}
          style={{
            position: 'fixed',
            left: 'var(--sp-4)',
            right: 'var(--sp-4)',
            bottom: 'calc(env(safe-area-inset-bottom) + var(--sp-4))',
            maxWidth: 640,
            margin: '0 auto',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 30,
          }}
          data-testid="confirm-finish"
        >
          <div className="card__title">
            {isLastSection ? t.exams.confirmFinish : t.exams.confirmNextSection}
          </div>
          <p className="card__body">{fill(t.exams.blanksWarning, { n: blankCount })}</p>
          {!isLastSection ? (
            <p className="card__body">{t.exams.noReturnWarning}</p>
          ) : null}
          <div className="row" style={{ marginTop: 'var(--sp-4)' }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              onClick={() => setConfirmFinish(false)}
            >
              {t.exams.keepGoing}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              onClick={closeSection}
              data-testid="confirm-finish-yes"
            >
              {isLastSection ? t.exams.finishAnyway : t.exams.nextSection}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
